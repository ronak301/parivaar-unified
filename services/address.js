const { Address } = require('../models');

exports.createAddress = async (payload, transaction) => {
  try {
    await Address.create(payload, {
      transaction,
    });
  } catch (error) {
    console.log(
      '🚀 ~ file: address.js:9 ~ exports.createBusiness= ~ error:',
      error
    );
    throw error;
  }
};
