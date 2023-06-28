const { User } = require('../models');

exports.insertUser = async (data, transaction) => {
  try {
    const user = await User.create(data, {
      transaction,
    });
    return user;
  } catch (err) {
    console.log(err);
    throw { message: 'Error while creating user' };
  }
};

exports.getUsersWithAll = async () => {
  const search = {
    firstName: 'Jine',
  };
  try {
    const users = await User.findAll({
      // where: {
      //   isAccountManager: true,
      // },
      include: [
        {
          model: User,
          as: 'relatives',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture'],
          through: {
            attributes: ['type'],
          },
        },
      ],
    });
    return users;
  } catch (err) {
    console.log(err);
    throw { message: 'Error while getting users' };
  }
};
