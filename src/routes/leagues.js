const express = require('express');
const router = express.Router();
const { getLeagues } = require('../controllers/leagueController');

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: Get all active leagues
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [live, upcoming, completed]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of leagues
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/', getLeagues);

module.exports = router;