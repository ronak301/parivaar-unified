const {
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinesses,
  getBusinessByCommunityId,
} = require('../services/business');
const { getUsersByX } = require('../services/user');

const getBusinessesByCommunityController = async (req, res) => {
  const { query, filter, skip, limit } = req.body;
  const { community_id } = req.params;

  try {
    const data = await getBusinessByCommunityId({
      community_id,
      query,
      filter,
      skip,
      limit,
    });

    res.json({
      success: true,
      data,
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

const getBusinessByIdController = async (req, res) => {};

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
  getBusinessesByCommunityController,
  getBusinessByIdController,
  createBusinessController,
  deleteBusinessController,
  updateBusinessController,
};
