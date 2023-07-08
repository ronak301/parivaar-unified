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
