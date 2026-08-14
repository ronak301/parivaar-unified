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
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: 'executives',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['communityId', 'userId'],
        name: 'unq_executive',
      },
    ],
  }
);

module.exports = Executive;
