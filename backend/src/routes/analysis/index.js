const express = require('express');
const router = express.Router();
const matchAnalysisController = require('../../controllers/analysis/matchAnalysisController');

// Match Statistics
router.get('/matches/:matchId/analysis/stats', matchAnalysisController.getMatchStats);

// Head-to-Head Analysis
router.get('/matches/:matchId/analysis/h2h', matchAnalysisController.getHeadToHead);

// Team Form Analysis
router.get('/matches/:matchId/analysis/form', matchAnalysisController.getTeamForm);

// Live Match Updates
router.get('/matches/:matchId/analysis/live', matchAnalysisController.getLiveMatchUpdates);

module.exports = router;
