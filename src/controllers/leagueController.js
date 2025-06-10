const { League } = require('../models');
const { Op } = require('sequelize');

class LeagueController {
  async getLiveAndUpcomingLeagues(req, res) {
    try {
      const leagues = await League.findAll({
        where: {
          status: {
            [Op.in]: ['LIVE', 'UPCOMING']
          },
          start_date: {
            [Op.gte]: new Date()
          }
        },
        order: [
          ['start_date', 'ASC']
        ]
      });
      
      return res.json(leagues);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLeaguesByRegion(req, res) {
    const { region } = req.params;
    
    try {
      const leagues = await League.findAll({
        where: {
          region,
          status: {
            [Op.ne]: 'CANCELLED'
          }
        },
        order: [
          ['start_date', 'ASC']
        ]
      });
      
      return res.json(leagues);
    } catch (error) {
      console.error('Error fetching leagues by region:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new LeagueController();