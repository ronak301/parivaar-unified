const { Sequelize } = require('sequelize');
const { Executive } = require('../models');

exports.insertExecutive = async (data) => {
  try {
    const executive = await Executive.create(data);
    return executive;
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:8 ~ exports.insertExecutive= ~ err:',
      err
    );
    throw err;
  }
};

exports.addRole = async ({ id, roles }) => {
  try {
    await Executive.update(
      {
        roles: Sequelize.fn(
          'array_cat',
          Sequelize.col('roles'),
          Sequelize.literal(`ARRAY['${roles.join("','")}']::VARCHAR[]`)
        ),
      },
      {
        where: { id },
      }
    );
  } catch (error) {
    console.log(
      '🚀 ~ file: executive.js:31 ~ exports.addRole= ~ error:',
      error
    );
    throw error;
  }
};

exports.checkRoles = async ({ userId, communityId, rolesToCheck }) => {
  try {
    const data = await Executive.findOne({
      where: {
        userId: userId,
        communityId: communityId,
        roles: {
          [Sequelize.Op.overlap]: rolesToCheck,
        },
      },
    });
    if (data) return true;
    return false;
  } catch (error) {
    console.log(
      '🚀 ~ file: executive.js:52 ~ exports.checkRoles= ~ error:',
      error
    );
    throw error;
  }
};
