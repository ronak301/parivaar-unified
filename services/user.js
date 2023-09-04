const { User, Business, Address, Community } = require('../models');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');
const { createBusiness } = require('./business');
const { createAddress } = require('./address');

exports.insertUser = async (data, transaction) => {
  try {
    const user = await User.create(data, {
      transaction,
    });

    if (data.hasBusiness) {
      await createBusiness({ ownerId: user.id, ...data.business }, transaction);
    }
    await createAddress({ userId: user.id, ...data.address }, transaction);

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
      order: [['firstName', 'ASC']],
    });
    return users;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getUserEvents = async ({ communityId, skip, limit }) => {
  const currentMonth = moment().month() + 1;

  const currentDay = moment().date();

  const nextDay = moment().add(1, 'day').date();

  const nextDayMonth = moment().add(1, 'days').month() + 1;

  try {
    const data = await User.findAll({
      include: [
        {
          model: Community,
          as: 'communities',
          required: true,
          through: {
            attributes: [],
            where: { communityId: communityId },
          },
          attributes: [],
        },
      ],
      where: Sequelize.literal(`(
        (EXTRACT(MONTH FROM dob) = ${currentMonth} AND EXTRACT(DAY FROM dob) = ${currentDay})
        OR (EXTRACT(MONTH FROM dob) = ${nextDayMonth} AND EXTRACT(DAY FROM dob) = ${nextDay})) OR
        wedding_date is NOT NULL
        AND ((EXTRACT(MONTH FROM wedding_date) = ${currentMonth} AND EXTRACT(DAY FROM wedding_date) = ${currentDay})
        OR (EXTRACT(MONTH FROM wedding_date) = ${nextDayMonth} AND EXTRACT(DAY FROM wedding_date) = ${nextDay}))
        `),
      attributes: {
        include: [
          [
            Sequelize.literal(`CASE
            WHEN
              (EXTRACT(MONTH FROM dob) = ${currentMonth} AND EXTRACT(DAY FROM dob) = ${currentDay})
              OR (EXTRACT(MONTH FROM dob) = ${nextDayMonth} AND EXTRACT(DAY FROM dob) = ${nextDay})
            THEN 'birthday'

            WHEN
              wedding_date is NOT NULL
              AND ((EXTRACT(MONTH FROM wedding_date) = ${currentMonth} AND EXTRACT(DAY FROM wedding_date) = ${currentDay})
              OR (EXTRACT(MONTH FROM wedding_date) = ${nextDayMonth} AND EXTRACT(DAY FROM wedding_date) = ${nextDay}))
            THEN 'anniversary'

            ELSE 'none'
            END`),
            'eventType',
          ],
        ],
      },
      order: [
        ['dob', 'ASC'],
        ['wedding_date', 'ASC'],
      ],
      offset: skip,
      limit: limit,
    });

    return data;
  } catch (err) {
    console.log('🚀 ~ file: user.js:61 ~ exports.getUserEvents= ~ err:', err);
    throw err;
  }
};

// exports.getUserEvents = async ({ communityId, skip, limit }) => {
//   const today = moment();
//   const tomorrow = moment().add(1, 'days');

//   try {
//     const data = await User.findAll({
//       include: [
//         {
//           model: Community,
//           as: 'communities',
//           required: true,
//           through: {
//             attributes: [],
//             where: { communityId: communityId },
//           },
//           attributes: [],
//         },
//       ],
//       where: {
//         [Sequelize.Op.or]: [
//           {
//             [Sequelize.Op.and]: [
//               Sequelize.where(
//                 Sequelize.fn('MONTH', Sequelize.col('dob')),
//                 today.month() + 1
//               ),
//               Sequelize.where(
//                 Sequelize.fn('DAY', Sequelize.col('dob')),
//                 today.date()
//               ),
//             ],
//           },
//           {
//             [Sequelize.Op.and]: [
//               Sequelize.where(
//                 Sequelize.fn('MONTH', Sequelize.col('wedding_date')),
//                 today.month() + 1
//               ),
//               Sequelize.where(
//                 Sequelize.fn('DAY', Sequelize.col('wedding_date')),
//                 today.date()
//               ),
//             ],
//           },
//           {
//             [Sequelize.Op.and]: [
//               Sequelize.where(
//                 Sequelize.fn('MONTH', Sequelize.col('dob')),
//                 tomorrow.month() + 1
//               ),
//               Sequelize.where(
//                 Sequelize.fn('DAY', Sequelize.col('dob')),
//                 tomorrow.date()
//               ),
//             ],
//           },
//           {
//             [Sequelize.Op.and]: [
//               Sequelize.where(
//                 Sequelize.fn('MONTH', Sequelize.col('wedding_date')),
//                 tomorrow.month() + 1
//               ),
//               Sequelize.where(
//                 Sequelize.fn('DAY', Sequelize.col('wedding_date')),
//                 tomorrow.date()
//               ),
//             ],
//           },
//         ],
//       },
//       attributes: {
//         include: [
//           [
//             Sequelize.literal(`CASE
//               WHEN
//                 (EXTRACT(MONTH FROM dob) = ${
//                   today.month() + 1
//                 } AND EXTRACT(DAY FROM dob) = ${today.date()})
//                 OR (EXTRACT(MONTH FROM wedding_date) = ${
//                   today.month() + 1
//                 } AND EXTRACT(DAY FROM wedding_date) = ${today.date()})
//               THEN 'birthday'

//               WHEN
//                 (EXTRACT(MONTH FROM dob) = ${
//                   tomorrow.month() + 1
//                 } AND EXTRACT(DAY FROM dob) = ${tomorrow.date()})
//                 OR (EXTRACT(MONTH FROM wedding_date) = ${
//                   tomorrow.month() + 1
//                 } AND EXTRACT(DAY FROM wedding_date) = ${tomorrow.date()})
//               THEN 'anniversary'

//               ELSE 'none'
//               END`),
//             'eventType',
//           ],
//         ],
//       },
//       order: [
//         ['dob', 'DESC'],
//         ['wedding_date', 'DESC'],
//       ],
//       offset: skip,
//       limit: limit,
//     });

//     return data;
//   } catch (err) {
//     console.log('🚀 ~ file: user.js:61 ~ exports.getUserEvents= ~ err:', err);
//     throw err;
//   }
// };

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
                fullName: {
                  [Op.iLike]: `%${query}%`,
                },
              },
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
        'dob',
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
      order: [
        ['firstName', 'ASC'],
        ['lastName', 'ASC'],
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
    const user = await User.findByPk(id, {
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
