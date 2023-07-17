const Business = require('../models/Business');
const User = require('../models/User');
const {
  createBusiness,
  updateBusiness,
  deleteBusiness,
} = require('../services/business');

const getBusinessController = async (req, res) => {
  const businesses = await Business.findAll({
    offset: 0,
    limit: 10,
  });

  const ownerIds = businesses.map((business) => business.ownerId);

  const users = await User.findAll({
    where: {
      id: ownerIds,
    },
    attributes: [
      'id',
      'firstName',
      'lastName',
      'profilePicture',
      'phone',
      'bloodGroup',
      'education',
    ],
  });

  // Then associate owners with businesses in-memory
  const businessesWithOwners = businesses.map((business) => {
    const owner = users.find((user) => user.id === business.ownerId);
    return { ...business.toJSON(), owner };
  });
  res.json(businessesWithOwners);
};

const createBusinessController = async (req, res) => {
  try {
    const business = await createBusiness(req.body);
    res.json({ success: true, business });
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:23 ~ createBusinessController ~ err:',
      err
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBusinessController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteBusiness(id);
    return res
      .status(201)
      .json({ success: true, message: 'Business Deleted Successfully' });
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:67 ~ deleteBusinessController ~ err:',
      err
    );

    return res.status(500).json({ success: false, error: err?.message });
  }
};

const updateBusinessController = async (req, res) => {
  try {
    const business = await updateBusiness(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Business updated successfully',
    });
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:49 ~ updateBusinessController ~ err:',
      err
    );
    return res.status(500).json({ success: false, error: err?.message });
  }
};

module.exports = {
  getBusinessController,
  createBusinessController,
  deleteBusinessController,
  updateBusinessController,
};
