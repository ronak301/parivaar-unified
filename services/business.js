const { Business } = require('../models');

exports.createBusiness = async (payload, transaction) => {
  try {
    const business = await Business.create(payload, {
      transaction,
    });

    return business;
  } catch (error) {
    console.log('🚀 ~ file: business.js:7 ~ createBusiness ~ error:', error);
    throw error;
  }
};

exports.updateBusiness = async (id, mutation) => {
  try {
    const business = await Business.update(mutation, {
      where: {
        id: id,
      },
    });
    return business;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.deleteBusiness = async (id) => {
  try {
    await Business.destroy({
      where: {
        id: id,
      },
    });

    return true;
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:40 ~ exports.deleteBusiness ~ err:',
      err
    );
    throw err;
  }
};
