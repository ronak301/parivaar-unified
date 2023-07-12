const { sequelize } = require('../config/database');
const { createAddress } = require('../services/address');
const { createBusiness } = require('../services/business');
const {
  insertUser,
  getUsersWithAll,
  updateUser,
  searchUser,
  getUserById,
  getUserWithCommunities,
  deleteUser,
} = require('../services/user');

const createUserController = async (req, res) => {
  const body = req.body;
  const transaction = await sequelize.transaction();

  try {
    const user = await insertUser(body, transaction);
    await createBusiness({ ownerId: user.id, ...body.business }, transaction);
    await createAddress({ userId: user.id, ...body.address }, transaction);
    await transaction.commit();

    return res.json({
      success: true,
      message: 'User created successfully',
      id: user.id,
    });
  } catch (err) {
    console.log('🚀 ~ file: user.js:28 ~ createUserController ~ err:', err);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      error: err.message,
      message: err.errors[0]?.message || 'Failed to insert user',
    });
  }
};

const getUserCommunityController = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await getUserWithCommunities(id);
    return res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const deleteUserController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUser(id);
    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.log('🚀 ~ file: user.js:56 ~ deleteUserController ~ err:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getUsersController = async (req, res) => {
  try {
    const users = await getUsersWithAll();

    return res.json({ success: true, data: users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    return res.json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    return res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const searchUserController = async (req, res) => {
  try {
    const users = await searchUser(req.body);

    return res.json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getUsersController,
  createUserController,
  getUserByIdController,
  updateUserController,
  searchUserController,
  getUserCommunityController,
  deleteUserController,
};
