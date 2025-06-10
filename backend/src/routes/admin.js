const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Get sync system status
 */
router.get('/sync/status', async (req, res) => {
  try {
    res.json({
      success: true,
      syncStatus: {
        apiProvider: 'FootyStats',
        status: 'active',
        message: 'System migrated to FootyStats API exclusively'
      }
    });
  } catch (error) {
    logger.error('Error getting sync status', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
