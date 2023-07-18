const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const CommunityMember = sequelize.define(
  'CommunityMember',
  {
    communityId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'community_members',
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

module.exports = CommunityMember;
