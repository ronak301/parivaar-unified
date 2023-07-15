const { updateAddress } = require('../services/address');

const updateAddressController = async (req, res) => {
  try {
    const address = await updateAddress(req.params.id, req.body);
    return res.json({
      success: true,
      address,
      message: 'Address updated successfully',
    });
  } catch (err) {
    console.log(
      '🚀 ~ file: address.js:10 ~ updateAddressController ~ err:',
      err
    );

    return res.status(500).json({ success: false, error: err?.message });
  }
};

module.exports = {
  updateAddressController,
};
