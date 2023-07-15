const { Op } = require('sequelize');
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
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'firstName',
        'lastName',
        'profilePicture',
        'bloodGroup',
        'phone',
      ],
    });
    return users;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getUserWithCommunities = async (id) => {
  try {
    const user = await User.findOne({
      where: {
        id: id,
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },

      include: [
        {
          model: Community,
          as: 'communities',
          through: {
            attributes: [],
          },
        },
      ],
    });

    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.deleteUser = async (id) => {
  try {
    await User.destroy({
      where: {
        id: id,
      },
    });
    return true;
  } catch (err) {
    console.log('🚀 ~ file: user.js:71 ~ exports.deleteUser ~ err:', err);
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

exports.searchUser = async ({ query, filter, skip, limit, order }) => {
  const { business: businessFilter, ...userFilter } = filter;
  try {
    const users = await User.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                firstName: {
                  [Op.iLike]: `%${query}%`,
                },
              },
              {
                lastName: {
                  [Op.iLike]: `%${query}%`,
                },
              },
              {
                phone: {
                  [Op.iLike]: `%${query}%`,
                },
              },
            ],
          },
          userFilter,
        ],
      },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'profilePicture',
        'phone',
        'bloodGroup',
        'education',
      ],
      include: [
        {
          model: Business,
          as: 'business',
          where: businessFilter ?? {},
          attributes: ['id', 'name', 'type'],
        },
      ],
      limit: limit,
      offset: skip,
    });
    return users;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getUserById = async (id) => {
  try {
    const user = await User.findOne({
      where: {
        id: id,
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },

      include: [
        {
          model: User,
          as: 'relatives',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'profilePicture',
            'phone',
            'education',
            'bloodGroup',
          ],
          through: {
            as: 'relationship',
            attributes: ['id', 'type'],
          },
          include: [
            {
              model: Business,
              as: 'business',
              attributes: ['id', 'name', 'type'],
            },
          ],
        },
        {
          model: Community,
          as: 'communities',
          through: {
            attributes: [],
          },
        },
        {
          model: Business,
          as: 'business',
        },
        {
          model: Address,
          as: 'address',
        },
      ],
    });

    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
