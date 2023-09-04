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
    fullName: {
      type: DataTypes.STRING,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    profilePicture: {
      type: DataTypes.STRING,
    },
    imagePath: {
      type: DataTypes.STRING,
    },
    guardianName: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    isMarried: {
      type: DataTypes.BOOLEAN,
    },
    bio: {
      type: DataTypes.STRING,
    },
    canEditFamilyMembers: {
      type: DataTypes.BOOLEAN,
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
    phone: {
      type: DataTypes.STRING,
      unique: true,
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
    authId: {
      type: DataTypes.UUID,
    },
    bloodGroup: {
      type: DataTypes.STRING,
    },
    facebookLink: {
      type: DataTypes.STRING,
    },
    instagramLink: {
      type: DataTypes.STRING,
    },
    linkedinLink: {
      type: DataTypes.STRING,
    },
    birthTime: {
      type: DataTypes.STRING,
    },
    bloodDonor: {
      type: DataTypes.BOOLEAN,
    },
    numberOfTimesBloodDonated: {
      type: DataTypes.INTEGER,
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
