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
      allowNull: false,
    },
    relativeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'relationships',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Relationship;
