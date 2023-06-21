const { insertUser, getUsersWithAll } = require('../services/user');

const createUser = async (req, res) => {
  const body = req.body;

  try {
    await insertUser(body);

    res.json({
      success: true,
      message: 'User created successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
};

const getUsers = async (req, res) => {
  const users = await getUsersWithAll();

  res.json({ success: true, data: users });
};

const getUserById = async (req, res) => {};

module.exports = {
  getUsers,
  createUser,
  getUserById,
};
