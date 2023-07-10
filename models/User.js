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
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.STRING,
    },
    guardianName: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    education: {
      type: DataTypes.STRING,
    },
    nativePlace: {
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
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    authId: {
      type: DataTypes.UUID,
    },
    bloodGroup: {
      type: DataTypes.STRING,
    },
    isAccountManager: {
      type: DataTypes.BOOLEAN,
    },
    lastSeen: {
      type: DataTypes.DATEONLY,
    },
    isSuperAdmin: {
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
const Relationship = require('./Relationship.js');
const Address = require('./Address.js');
const Community = require('./Community.js');
const CommunityMember = require('./CommunityMember.js');
// const Executive = require('./Executive.js');

User.hasOne(Business, {
  as: 'business',
  foreignKey: 'ownerId',
  onDelete: 'CASCADE',
});

User.hasOne(Address, {
  as: 'address',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

// User.belongsToMany(Community, {
//   through: Executive,
//   as: 'executives',
//   foreignKey: 'userId',
//   onDelete: 'CASCADE',
// });

User.belongsToMany(Community, {
  through: CommunityMember,
  as: 'communities',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

User.belongsToMany(User, {
  through: Relationship,
  as: 'relatives',
  foreignKey: 'userId',
  otherKey: 'relativeId',
  onDelete: 'CASCADE',
});

// User.belongsToMany(Community, {
//   through: Executive,
//   as: 'executives',
//   foreignKey: 'userId',
//   onDelete: 'CASCADE',
// });
