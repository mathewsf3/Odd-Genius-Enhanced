const cron = require('node-cron');
const teamMappingService = require('../services/teamMappingService');
const logger = require('../utils/logger');

/**
 * Scheduled Team Synchronization Job
 * Runs daily to keep team mappings updated with new teams and changes
 */

class TeamSyncJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null
    };
  }

  /**
   * Start the scheduled sync job
   */
  start() {
    // Run sync every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      await this.runSync();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Also run a lighter sync every 6 hours for new teams
    cron.schedule('0 */6 * * *', async () => {
      await this.runLightSync();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    logger.info('Team sync job scheduled', { 
      service: 'team-sync-job',
      dailySync: '3:00 AM UTC',
      lightSync: 'Every 6 hours'
    });

    // Calculate next run time
    this.updateNextRunTime();
  }

  /**
   * Run full synchronization
   */
  async runSync() {
    if (this.isRunning) {
      logger.warn('Sync already running, skipping', { service: 'team-sync-job' });
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date().toISOString();
    this.stats.totalRuns++;

    try {
      logger.info('Starting scheduled team sync', { service: 'team-sync-job' });

      const startTime = Date.now();
      
      // Run sync with incremental updates
      const result = await teamMappingService.syncAllTeams({
        forceRefresh: false, // Only refresh if data is stale
        incremental: true    // Only sync new/changed data
      });

      const duration = Math.round((Date.now() - startTime) / 1000);
      
      // Get updated stats
      const status = await teamMappingService.getSyncStatus();
      
      this.stats.successfulRuns++;
      this.stats.lastError = null;

      logger.info('Scheduled team sync completed successfully', { 
        service: 'team-sync-job',
        duration: `${duration}s`,
        totalMappings: status.stats.totalMappings,
        bothApisMapped: status.stats.bothApisMapped,
        averageConfidence: status.stats.averageConfidence
      });

      // Send success notification if configured
      await this.sendNotification('success', {
        duration,
        stats: status.stats
      });

    } catch (error) {
      this.stats.failedRuns++;
      this.stats.lastError = error.message;

      logger.error(`Scheduled team sync failed: ${error.message}`, { 
        service: 'team-sync-job',
        error: error.message,
        stack: error.stack
      });

      // Send failure notification
      await this.sendNotification('failure', {
        error: error.message
      });

    } finally {
      this.isRunning = false;
      this.updateNextRunTime();
    }
  }

  /**
   * Run light synchronization (only new teams, no full refresh)
   */
  async runLightSync() {
    if (this.isRunning) {
      return; // Skip if full sync is running
    }

    try {
      logger.info('Starting light team sync', { service: 'team-sync-job' });

      // Only sync if we have recent data
      const status = await teamMappingService.getSyncStatus();
      if (!status.lastSync) {
        logger.info('No previous sync found, skipping light sync', { service: 'team-sync-job' });
        return;
      }

      const lastSyncDate = new Date(status.lastSync);
      const hoursSinceSync = (Date.now() - lastSyncDate) / (1000 * 60 * 60);

      if (hoursSinceSync > 48) {
        logger.info('Data too stale for light sync, will wait for full sync', { 
          service: 'team-sync-job',
          hoursSinceSync 
        });
        return;
      }

      // Run light sync - only check for new teams in major leagues
      await teamMappingService.syncAllTeams({
        forceRefresh: false,
        incremental: true,
        lightSync: true,
        countries: ['England', 'Germany', 'Spain', 'Italy', 'France'] // Major leagues only
      });

      logger.info('Light team sync completed', { service: 'team-sync-job' });

    } catch (error) {
      logger.warn(`Light team sync failed: ${error.message}`, { 
        service: 'team-sync-job',
        error: error.message
      });
    }
  }

  /**
   * Get job status and statistics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      stats: { ...this.stats }
    };
  }

  /**
   * Manually trigger a sync
   */
  async triggerSync(options = {}) {
    logger.info('Manual sync triggered', { service: 'team-sync-job', options });
    
    if (options.light) {
      await this.runLightSync();
    } else {
      await this.runSync();
    }
  }

  /**
   * Update next run time calculation
   */
  updateNextRunTime() {
    const now = new Date();
    const next = new Date(now);
    
    // Next run is tomorrow at 3 AM
    next.setDate(next.getDate() + 1);
    next.setHours(3, 0, 0, 0);
    
    this.nextRun = next.toISOString();
  }

  /**
   * Send notifications (can be extended for email, Slack, etc.)
   */
  async sendNotification(type, data) {
    try {
      // Log notification (extend this for actual notifications)
      if (type === 'success') {
        logger.info('Team sync notification: Success', {
          service: 'team-sync-job',
          type: 'notification',
          duration: data.duration,
          totalMappings: data.stats.totalMappings
        });
      } else if (type === 'failure') {
        logger.error('Team sync notification: Failure', {
          service: 'team-sync-job',
          type: 'notification',
          error: data.error
        });
      }

      // TODO: Add email/Slack notifications here if needed
      // await emailService.send({
      //   to: 'admin@oddgenius.com',
      //   subject: `Team Sync ${type}`,
      //   body: JSON.stringify(data, null, 2)
      // });

    } catch (error) {
      logger.warn(`Failed to send notification: ${error.message}`, { 
        service: 'team-sync-job' 
      });
    }
  }

  /**
   * Stop the scheduled job
   */
  stop() {
    // Note: node-cron doesn't provide a direct way to stop specific jobs
    // This would need to be implemented if required
    logger.info('Team sync job stop requested', { service: 'team-sync-job' });
  }
}

// Create singleton instance
const teamSyncJob = new TeamSyncJob();

// Auto-start if not in test environment
if (process.env.NODE_ENV !== 'test') {
  teamSyncJob.start();
}

module.exports = teamSyncJob;
