const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Address = sequelize.define(
  'Address',
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
    fullAddress: {
      type: DataTypes.STRING,
    },
    pincode: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    locality: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Address;
