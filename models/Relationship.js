const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Relationship = sequelize.define(
  'Relationship',
  {
    id: {
      primaryKey: true,
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
    },
    relativeId: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'relationships',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Relationship;
