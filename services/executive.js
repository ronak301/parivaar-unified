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

exports.updateExecutive = async (id, mutation) => {
  try {
    const executive = await Executive.update(mutation, {
      where: {
        id: id,
      },
    });
    return executive;
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:49 ~ exports.updateExecutive= ~ err:',
      err
    );
    throw err;
  }
};

exports.deleteExecutive = async (id) => {
  try {
    await Executive.destroy({
      where: {
        id: id,
      },
    });

    return true;
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:48 ~ exports.deleteExecutive ~ err:',
      err
    );
    throw err;
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
