const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Applicant = sequelize.define(
  'Applicant',
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
    approvalStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'APPROVED',
    },
  },
  {
    tableName: 'applicants',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'communityId'],
        name: 'unq_member',
      },
    ],
  }
);

module.exports = Applicant;
