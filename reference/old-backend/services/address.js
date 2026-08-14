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

exports.updateAddress = async (id, mutation) => {
  try {
    const address = await Address.update(mutation, {
      where: {
        id: id,
      },
    });
    return address;
  } catch (err) {
    console.log(
      '🚀 ~ file: address.js:26 ~ exports.updateAddress= ~ err:',
      err
    );
    throw err;
  }
};
