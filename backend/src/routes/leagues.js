const express = require('express');
const router = express.Router();
const MappingNew = require('../services/MappingNew');

// GET all leagues
router.get('/leagues', async (req, res) => {
  try {
    console.log('Fetching all leagues...');

    // Get leagues from the mapping service
    const leagues = await MappingNew.getLeagues();

    console.log(`Returning ${leagues.length} leagues`);
    res.json(leagues);

  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({
      error: 'Failed to fetch leagues',
      message: error.message
    });
  }
});

// GET single league by ID
router.get('/leagues/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const leagues = await MappingNew.getLeagues();
    const league = leagues.find(l => l.id == id);

    if (!league) {
      return res.status(404).json({
        error: 'League not found'
      });
    }

    res.json(league);

  } catch (error) {
    console.error('Error fetching league:', error);
    res.status(500).json({
      error: 'Failed to fetch league',
      message: error.message
    });
  }
});

module.exports = router;