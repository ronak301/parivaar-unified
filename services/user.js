const { User, Business, Address, Community } = require('../models');

exports.insertUser = async (data, transaction) => {
  try {
    const user = await User.create(data, {
      transaction,
    });
    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getUsersWithAll = async () => {
  const search = {
    firstName: 'John',
  };
  try {
    const users = await User.findAll({
      where: search,
      include: [
        {
          model: User,
          as: 'relatives',
          through: {
            as: 'relationship',
            attributes: ['type'],
          },
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['name', 'type'],
            },
          ],
        },
        {
          model: Business,
          as: 'business',
        },
        {
          model: Address,
          as: 'address',
        },
        {
          model: Community,
          as: 'communities',
        },
      ],
    });
    return users;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.updateUser = async (id, mutation) => {
  try {
    const user = await User.update(mutation, {
      where: {
        id: id,
      },
    });
    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
