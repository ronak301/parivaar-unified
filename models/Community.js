const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Community = sequelize.define(
  'Community',
  {
    id: {
      primaryKey: true,
      type: DataTypes.BIGINT,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    logo: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    subType: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    code: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'communities',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Community;

const User = require('./User.js');
const Executive = require('./Executive.js');
const CommunityMember = require('./CommunityMember.js');

Community.belongsToMany(User, {
  through: CommunityMember,
  as: 'members',
  foreignKey: 'community_id',
  onDelete: 'CASCADE',
});

Community.belongsToMany(User, {
  through: Executive,
  as: 'executives',
  foreignKey: 'communityId',
  onDelete: 'CASCADE',
});

// Community.hasMany(Executive, {
//   foreignKey: 'community_id',
// });
