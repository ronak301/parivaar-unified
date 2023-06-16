const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Executive = sequelize.define(
  'Executive',
  {
    id: {
      primaryKey: true,
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    communityId: {
      type: DataTypes.BIGINT,
    },
    designation: {
      type: DataTypes.STRING,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
    },
    appointedOn: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    tableName: 'executives',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Executive;
