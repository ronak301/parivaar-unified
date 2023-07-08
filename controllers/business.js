const Business = require('../models/Business');
const User = require('../models/User');
const { createBusiness } = require('../services/business');

const getBusinessController = async (req, res) => {
  const business = await Business.findAll({
    where: {
      name: 'My Business',
    },
    include: {
      model: User,
    },
  });

  res.json(business);
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
  const business = await Business.destroy({
    where: {
      id: 1,
    },
  });

  res.json(business);
};

module.exports = {
  getBusinessController,
  createBusinessController,
  deleteBusinessController,
};
