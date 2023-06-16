const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Address = sequelize.define(
  'Address',
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    address: {
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
