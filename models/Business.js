const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Business = sequelize.define(
  'Business',
  {
    id: {
      primaryKey: true,
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    subType: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'businesses',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Business;
