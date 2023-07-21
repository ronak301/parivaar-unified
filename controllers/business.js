const {
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinesses,
} = require('../services/business');
const { getUsersByX } = require('../services/user');

const getBusinessesController = async (req, res) => {
  const { skip, limit } = req.body;
  try {
    const { count, businesses } = await getBusinesses({ skip, limit });

    const ownerIds = businesses.map((business) => business.ownerId);

    const users = await getUsersByX({
      id: ownerIds,
    });

    const businessesWithOwners = businesses.map((business) => {
      const owner = users.find((user) => user.id === business.ownerId);
      return { ...business.toJSON(), owner };
    });
    res.json({
      success: true,
      total: count,
      data: businessesWithOwners,
    });
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:33 ~ getBusinessesController ~ err:',
      err
    );
    res.status(500).json({ success: false, message: err?.message });
  }
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
    res.status(500).json({ success: false, message: err?.message });
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
  getBusinessesController,
  createBusinessController,
  deleteBusinessController,
  updateBusinessController,
};
