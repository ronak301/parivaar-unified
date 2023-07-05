const Business = require('../models/Business');
const User = require('../models/User');

const getBusiness = async (req, res) => {
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

const createBusiness = async (req, res) => {
  const business = await Business.create(req.body);

  res.json(business);
};

const deleteBusiness = async (req, res) => {
  const business = await Business.destroy({
    where: {
      id: 1,
    },
  });

  res.json(business);
};

module.exports = {
  getBusiness,
  createBusiness,
  deleteBusiness,
};
