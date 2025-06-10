const MappingNew = require('../services/MappingNew');
const logger = require('../utils/logger');
const cron = require('node-cron');

class MatchSyncJob {
  constructor() {
    this.isRunning = false;
    this.recentSyncJob = null;
    this.historicalSyncJob = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      lastRun: null,
      lastSuccess: null,
      lastError: null
    };
  }

  start() {
    try {
      // Run every 30 minutes for live/upcoming matches
      this.recentSyncJob = cron.schedule('*/30 * * * *', () => {
        this.syncRecentMatches();
      }, {
        scheduled: false
      });

      // Run daily sync for historical data at 3 AM
      this.historicalSyncJob = cron.schedule('0 3 * * *', () => {
        this.syncHistoricalMatches();
      }, {
        scheduled: false
      });

      // Start the jobs
      this.recentSyncJob.start();
      this.historicalSyncJob.start();

      logger.info('Match sync jobs started', {
        recentSync: 'Every 30 minutes',
        historicalSync: 'Daily at 3 AM'
      });

      // Run initial sync after a short delay
      setTimeout(() => {
        this.syncRecentMatches();
      }, 5000);

    } catch (error) {
      logger.error('Failed to start match sync jobs', { error: error.message });
    }
  }

  async syncRecentMatches() {
    if (this.isRunning) {
      logger.warn('Match sync already running, skipping this cycle');
      return;
    }

    this.isRunning = true;
    this.stats.totalRuns++;
    this.stats.lastRun = new Date().toISOString();

    try {
      logger.info('Starting recent match sync job');

      // Sync matches from 1 day ago to 7 days ahead
      const result = await MappingNew.syncMatches({
        from: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
        forceUpdate: false
      });

      this.stats.successfulRuns++;
      this.stats.lastSuccess = new Date().toISOString();

      logger.info('Recent match sync completed successfully', {
        syncId: result.id,
        duration: `${Math.round(result.stats.duration / 1000)}s`,
        matchesFetched: result.stats.matches.fetched,
        matchesMapped: result.stats.matches.mapped,
        errors: result.errors.length
      });

      if (result.errors.length > 0) {
        logger.warn('Recent match sync completed with errors', {
          errorCount: result.errors.length,
          errors: result.errors.slice(0, 3) // Log first 3 errors
        });
      }

    } catch (error) {
      this.stats.lastError = {
        message: error.message,
        timestamp: new Date().toISOString()
      };

      logger.error('Recent match sync failed', {
        error: error.message,
        stack: error.stack
      });
    } finally {
      this.isRunning = false;
    }
  }

  async syncHistoricalMatches() {
    try {
      logger.info('Starting historical match sync job');

      // Sync last 30 days
      const result = await MappingNew.syncMatches({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date(), // today
        forceUpdate: false
      });

      logger.info('Historical match sync completed successfully', {
        syncId: result.id,
        duration: `${Math.round(result.stats.duration / 1000)}s`,
        matchesFetched: result.stats.matches.fetched,
        matchesMapped: result.stats.matches.mapped,
        errors: result.errors.length
      });

      if (result.errors.length > 0) {
        logger.warn('Historical match sync completed with errors', {
          errorCount: result.errors.length,
          errors: result.errors.slice(0, 3)
        });
      }

    } catch (error) {
      logger.error('Historical match sync failed', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  async runManualSync(options = {}) {
    if (this.isRunning) {
      throw new Error('Sync already running. Please wait for current sync to complete.');
    }

    const {
      from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      forceUpdate = false
    } = options;

    logger.info('Starting manual match sync', { from: from.toISOString(), to: to.toISOString(), forceUpdate });

    return await MappingNew.syncMatches({ from, to, forceUpdate });
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      stats: this.stats,
      nextRuns: {
        recentSync: this.recentSyncJob ? 'Every 30 minutes' : null,
        historicalSync: this.historicalSyncJob ? 'Daily at 3 AM' : null
      },
      systemStats: MappingNew.getStatistics()
    };
  }

  stop() {
    try {
      if (this.recentSyncJob) {
        this.recentSyncJob.stop();
        this.recentSyncJob = null;
      }

      if (this.historicalSyncJob) {
        this.historicalSyncJob.stop();
        this.historicalSyncJob = null;
      }

      logger.info('Match sync jobs stopped');
    } catch (error) {
      logger.error('Error stopping match sync jobs', { error: error.message });
    }
  }
}

module.exports = new MatchSyncJob();
