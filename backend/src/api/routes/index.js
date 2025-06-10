/**
 * API routes index
 */
const express = require('express');
const router = express.Router();

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;