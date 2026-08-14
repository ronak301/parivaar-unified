const {
  insertExecutive,
  addRole,
  deleteExecutive,
  updateExecutive,
  checkAdmin,
} = require('../services/executive');

const createExecutiveController = async (req, res) => {
  const { communityId, userId, roles } = req.body;
  try {
    await insertExecutive({ communityId, userId, roles });
    return res
      .status(201)
      .json({ success: true, message: 'Executive Created Successfully' });
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:8 ~ createExecutiveController ~ err:',
      err
    );
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const deleteExecutiveController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteExecutive(id);
    return res
      .status(201)
      .json({ success: true, message: 'Executive Deleted Successfully' });
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:31 ~ deleteExecutiveController ~ err:',
      err
    );

    return res.status(500).json({ success: false, error: err?.message });
  }
};

const updateExecutiveController = async (req, res) => {
  try {
    await updateExecutive(req.params.id, req.body);
    return res.json({
      success: true,
      message: 'Executive updated successfully',
    });
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:48 ~ updateExecutiveController ~ err:',
      err
    );

    return res.status(500).json({ success: false, error: err?.message });
  }
};

const checkAdminController = async (req, res) => {
  const { phone } = req.body;
  try {
    const permission = await checkAdmin({ phone });
    return res.status(201).json({ success: true, permission });
  } catch (err) {
    console.log(
      '🚀 ~ file: executive.js:64 ~ checkAdminController ~ err:',
      err
    );
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const addRoleController = async (req, res) => {
  const { id, roles } = req.body;
  try {
    await addRole({ id, roles });
    return res
      .status(201)
      .json({ success: true, message: 'Role Added Successfully ' });
  } catch (err) {
    console.log('🚀 ~ file: executive.js:24 ~ addRoleController ~ err:', err);
    return res.status(500).json({ success: false, error: err?.message });
  }
};

module.exports = {
  createExecutiveController,
  addRoleController,
  deleteExecutiveController,
  checkAdminController,
  updateExecutiveController,
};
