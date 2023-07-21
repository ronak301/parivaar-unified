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
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
    },
    imagePath: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
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
  foreignKey: 'communityId',
  onDelete: 'CASCADE',
});

Community.belongsToMany(User, {
  through: Executive,
  as: 'executives',
  foreignKey: 'communityId',
  onDelete: 'CASCADE',
});
