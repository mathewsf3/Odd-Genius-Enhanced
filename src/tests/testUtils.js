const { League } = require('../models');

exports.createTestLeagues = async () => {
  const now = new Date();
  
  const testData = [
    {
      name: 'Live League',
      status: 'live',
      startDate: new Date(now - 86400000), // yesterday
      endDate: new Date(now + 86400000), // tomorrow
      isActive: true
    },
    {
      name: 'Upcoming League',
      status: 'upcoming',
      startDate: new Date(now + 86400000), // tomorrow
      endDate: new Date(now + (86400000 * 7)), // 7 days later
      isActive: true
    },
    {
      name: 'Completed League',
      status: 'completed',
      startDate: new Date(now - (86400000 * 7)), // 7 days ago
      endDate: new Date(now - 86400000), // yesterday
      isActive: true
    }
  ];

  return await League.bulkCreate(testData);
};

exports.cleanupTestLeagues = async () => {
  await League.destroy({
    where: {
      name: ['Live League', 'Upcoming League', 'Completed League']
    }
  });
};