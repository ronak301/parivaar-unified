const {
  insertUser,
  getUsersWithAll,
  updateUser,
  searchUser,
} = require('../services/user');

const createUserController = async (req, res) => {
  const body = req.body;

  try {
    await insertUser(body);

    return res.json({
      success: true,
      message: 'User created successfully',
    });
  } catch (err) {
    console.log(err);
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

const getUserByIdController = async (req, res) => {};

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
};
