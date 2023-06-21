const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const CommunityMembers = sequelize.define(
  'CommunityMembers',
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

module.exports = CommunityMembers;
