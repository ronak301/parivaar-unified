const { Op } = require('sequelize');
const { Business, Community, User } = require('../models');
const db = require('../models');

exports.createBusiness = async (payload, transaction) => {
  try {
    const business = await Business.create(payload, {
      transaction,
    });

    return business;
  } catch (error) {
    console.log('🚀 ~ file: business.js:7 ~ createBusiness ~ error:', error);
    throw error;
  }
};

exports.getBusinessByCommunityId = async ({
  community_id,
  query,
  filter = {},
  skip,
  limit,
}) => {
  try {
    const data = await User.findAndCountAll({
      attributes: ['firstName', 'lastName', 'phone'],
      include: [
        {
          model: Community,
          as: 'communities',
          required: true,
          through: {
            attributes: [],
            where: { communityId: community_id },
          },
          attributes: [],
        },
        {
          model: Business,
          as: 'business',
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    name: {
                      [Op.iLike]: `%${query}%`,
                    },
                  },
                  {
                    description: {
                      [Op.iLike]: `%${query}%`,
                    },
                  },
                ],
              },
              filter,
            ],
          },
          required: true,
        },
      ],
      offset: skip,
      limit: limit,
    });

    return data;
  } catch (error) {
    console.log(
      '🚀 ~ file: business.js:48 ~ exports.getBusinessByCommunityId= ~ error:',
      error
    );
    throw error;
  }
};

exports.getBusinesses = async ({ skip, limit }) => {
  try {
    const { count, rows: businesses } = await Business.findAndCountAll({
      where: {
        name: {
          [Op.ne]: null,
        },
      },
      limit: limit,
      offset: skip,
    });

    return { count, businesses };
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:20 ~ exports.getBusinesses= ~ err:',
      err
    );
    throw err;
  }
};

exports.updateBusiness = async (id, mutation) => {
  try {
    const business = await Business.update(mutation, {
      where: {
        id: id,
      },
    });
    return business;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.deleteBusiness = async (id) => {
  try {
    await Business.destroy({
      where: {
        id: id,
      },
    });

    return true;
  } catch (err) {
    console.log(
      '🚀 ~ file: business.js:40 ~ exports.deleteBusiness ~ err:',
      err
    );
    throw err;
  }
};
