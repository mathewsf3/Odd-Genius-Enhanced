const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// Get comprehensive match analysis (main endpoint)
router.get('/matches/:id', analysisController.getMatchAnalysis);

// Get head-to-head analysis
router.get('/h2h/:team1Id/:team2Id', analysisController.getHeadToHead);

// Get team form analysis
router.get('/team-form/:teamId', analysisController.getTeamForm);



// Get card analysis
router.get('/cards/:matchId', analysisController.getCardAnalysis);

// Get corner analysis
router.get('/corners/:matchId', analysisController.getCornerAnalysis);

module.exports = router;
