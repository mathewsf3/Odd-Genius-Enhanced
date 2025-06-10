const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const League = sequelize.define('League', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      index: true // Index for name searches
    },
    status: {
      type: DataTypes.ENUM('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'UPCOMING',
      index: true // Index for status filtering
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      index: true // Index for date range queries
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: false,
      index: true // Index for region filtering
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prize_pool: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'leagues',
    timestamps: true,
    indexes: [
      // Composite index for common filtering scenarios
      {
        name: 'idx_status_start_date',
        fields: ['status', 'start_date']
      },
      // Composite index for region-based queries
      {
        name: 'idx_region_status',
        fields: ['region', 'status']
      }
    ]
  });

  return League;
};