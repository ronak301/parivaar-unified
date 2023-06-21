const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Executive = sequelize.define(
  'executive',
  {
    id: {
      primaryKey: true,
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    communityId: {
      type: DataTypes.BIGINT,
    },
    userId: {
      type: DataTypes.UUID,
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
  },
  {
    tableName: 'executives',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Executive;
