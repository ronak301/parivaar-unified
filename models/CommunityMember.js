const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const CommunityMember = sequelize.define(
  'CommunityMember',
  {
    communityId: {
      type: DataTypes.BIGINT,
    },
    userId: {
      type: DataTypes.UUID,
    },
  },
  {
    tableName: 'community_members',
    underscored: true,
    timestamps: true,
  }
);

module.exports = CommunityMember;
