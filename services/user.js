const { User, Business, Address, Community } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const moment = require('moment');

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

exports.getUsersByX = async (where) => {
  try {
    const users = await User.findAll({
      where,
      attributes: [
        'id',
        'firstName',
        'lastName',
        'profilePicture',
        'phone',
        'bloodGroup',
        'education',
      ],
    });
    return users;
  } catch (err) {
    console.log('🚀 ~ file: user.js:25 ~ exports.getUsersByX= ~ err:', err);
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

exports.getUserEvents = async ({ skip, limit }) => {
  const currentMonth = moment().month() + 1;
  const currentDay = moment().date();

  const nextMonthDay = moment().add(1, 'months').date();
  const nextMonth = moment().add(1, 'months').month() + 1;

  try {
    const data = await User.findAll({
      where: Sequelize.literal(`(
        (EXTRACT(MONTH FROM dob) = ${currentMonth} AND EXTRACT(DAY FROM dob) >= ${currentDay})
        OR (EXTRACT(MONTH FROM dob) = ${nextMonth} AND EXTRACT(DAY FROM dob) <= ${nextMonthDay})
        OR (
          wedding_date is NOT NULL AND ((EXTRACT(MONTH FROM wedding_date) = ${currentMonth} AND EXTRACT(DAY FROM wedding_date) >= ${currentDay})
          OR (EXTRACT(MONTH FROM wedding_date) = ${nextMonth} AND EXTRACT(DAY FROM wedding_date) <= ${nextMonthDay}))
        ))`),
      attributes: {
        include: [
          [
            Sequelize.literal(`CASE 
            WHEN
              (EXTRACT(MONTH FROM dob) = ${currentMonth} AND EXTRACT(DAY FROM dob) >= ${currentDay})
              OR (EXTRACT(MONTH FROM dob) = ${nextMonth} AND EXTRACT(DAY FROM dob) <= ${nextMonthDay})
            THEN 'birthday'
          
            WHEN
              wedding_date is NOT NULL
              AND ((EXTRACT(MONTH FROM wedding_date) = ${currentMonth} AND EXTRACT(DAY FROM wedding_date) >= ${currentDay})
              OR (EXTRACT(MONTH FROM wedding_date) = ${nextMonth} AND EXTRACT(DAY FROM wedding_date) <= ${nextMonthDay}))
            THEN 'anniversary'   
          
            ELSE 'none'
            END`),
            'eventType',
          ],
        ],
      },
      offset: skip,
      limit: limit,
    });

    return data;
  } catch (err) {
    console.log('🚀 ~ file: user.js:61 ~ exports.getUserEvents= ~ err:', err);
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
  const {
    business: businessFilter,
    address: addressFilter,
    ...userFilter
  } = filter;
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
          where: businessFilter ?? null,
          attributes: ['id', 'name', 'type'],
        },
        {
          model: Address,
          as: 'address',
          where: addressFilter ?? null,
          attributes: [],
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
