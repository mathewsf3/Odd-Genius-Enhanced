'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leagues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'UPCOMING'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      region: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      prize_pool: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('leagues', ['name']);
    await queryInterface.addIndex('leagues', ['status']);
    await queryInterface.addIndex('leagues', ['start_date']);
    await queryInterface.addIndex('leagues', ['region']);
    await queryInterface.addIndex('leagues', ['status', 'start_date']);
    await queryInterface.addIndex('leagues', ['region', 'status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('leagues');
  }
};