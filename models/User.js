const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const User = sequelize.define(
  'User',
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    businessId: {
      type: DataTypes.BIGINT,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    profilePicture: {
      type: DataTypes.STRING,
    },
    guardianName: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.STRING,
    },
    education: {
      type: DataTypes.STRING,
    },
    nativePlace: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    landline: {
      type: DataTypes.STRING,
    },
    weddingDate: {
      type: DataTypes.DATEONLY,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    bloodGroup: {
      type: DataTypes.STRING,
    },
    isAccountManager: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;

const Business = require('./Business.js');
const Address = require('./Address.js');
const Community = require('./community.js');
const CommunityMembers = require('./CommunityMembers.js');
const Relationship = require('./Relationship.js');

User.hasOne(Business, {
  foreignKey: 'owner_id',
  onDelete: 'CASCADE',
});

User.hasOne(Address, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

User.belongsToMany(Community, {
  through: CommunityMembers,
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

User.belongsToMany(User, {
  through: Relationship,
  as: 'relatives',
  foreignKey: 'user_id',
  otherKey: 'relative_id',
  onDelete: 'CASCADE',
});
