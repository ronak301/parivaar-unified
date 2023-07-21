const { Sequelize, Op } = require('sequelize');
const { User, Community, CommunityMember, Executive } = require('../models');
const Business = require('../models/Business');

exports.insertCommunity = async (data) => {
  try {
    const community = await Community.create({
      name: data.name,
      description: data.description,
      type: data.type,
      subType: data.subType,
      status: data.status,
    });
    return community;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.addCommunityMember = async (communityId, userId) => {
  try {
    await CommunityMember.create({
      communityId,
      userId,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.deleteCommunityMember = async (communityId, userId) => {
  try {
    await CommunityMember.destroy({
      where: {
        communityId,
        userId,
      },
    });
  } catch (err) {
    console.log(
      '🚀 ~ file: community.js:42 ~ exports.deleteCommunityMember ~ err:',
      err
    );
    throw err;
  }
};

exports.getCommunities = async () => {
  try {
    const communities = await Community.findAll({
      attributes: [
        'id',
        'name',
        'logo',
        'description',
        'type',
        'subType',
        'code',
        'status',
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.col('members->CommunityMember.user_id')
          ),
          'totalMembers',
        ],
      ],
      include: [
        {
          model: User,
          as: 'members',
          attributes: [],
          through: {
            attributes: [],
          },
        },
      ],
      group: [
        Sequelize.col('Community.id'),
        Sequelize.col('members->CommunityMember.community_id'),
      ],
    });

    return communities;
  } catch (err) {
    console.log(
      '🚀 ~ file: community.js:88 ~ exports.getCommunities= ~ err:',
      err
    );
    throw err;
  }
};

exports.updateCommunity = async (id, mutation) => {
  try {
    const community = await Community.update(mutation, {
      where: {
        id: id,
      },
    });
    return community;
  } catch (err) {
    console.log(
      '🚀 ~ file: community.js:85 ~ exports.updateCommunity= ~ err:',
      err
    );
    throw err;
  }
};

exports.getCommunityWithAll = async (communityId) => {
  try {
    const members = await Community.findByPk(communityId, {
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: User,
          as: 'executives',
          through: {
            model: Executive,
            as: 'executive',
            attributes: ['id', 'roles'],
          },
          attributes: [
            'id',
            'firstName',
            'lastName',
            'bloodGroup',
            'profilePicture',
            'phone',
          ],
        },
      ],
    });

    return members;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// exports.getCommunityMembers = async ({ id, skip, limit }) => {
//   try {
//     const members = await User.findAll({
//       include: [
//         {
//           model: Community,
//           as: 'communities',
//           through: {
//             model: CommunityMember,
//             attributes: [],
//             where: { community_id: id },
//           },
//           attributes: [],
//         },
//       ],
//       attributes: ['firstName', 'lastName'],
//       limit: limit,
//       offset: skip,
//     });

//     return members;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// exports.getCommunityMembers = async ({ id, skip, limit }) => {
//   try {
//     // Fetch the community
//     const community = await Community.findByPk(id);

//     if (!community) {
//       throw new Error('Community not found');
//     }

//     // Use 'get' function to fetch members with limit and offset
//     const members = await community.getMembers({
//       attributes: ['firstName', 'lastName'],
//       through: { attributes: [] }, // Exclude attributes from 'CommunityMember'
//       limit: limit,
//       offset: skip,
//     });
//     console.log(
//       '🚀 ~ file: community.js:110 ~ exports.getCommunityMembers= ~ members:',
//       members
//     );

//     // Remove 'CommunityMember' key from each member object
//     const formattedMembers = members.map((member) => {
//       const plainMember = member.toJSON();
//       delete plainMember.CommunityMember;
//       return plainMember;
//     });

//     // Fetch total count of members in the community for pagination
//     const totalRecords = await community.countMembers();

//     // Return the paginated member data along with the totalRecords
//     return {
//       totalRecords,
//       members: formattedMembers,
//     };
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

exports.getCommunityMembers = async ({
  id,
  query,
  filter,
  skip,
  limit,
  order,
}) => {
  const {
    business: businessFilter,
    address: addressFilter,
    ...userFilter
  } = filter;
  try {
    const members = await User.findAndCountAll({
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
          businessFilter
            ? {
                '$business.type$': businessFilter.type,
              }
            : {},
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
          model: Community,
          as: 'communities',
          where: { id: id },
          attributes: [], // Exclude Community attributes
          through: { attributes: [] }, // Exclude 'through' attributes (CommunityMember)
        },
        {
          model: Business,
          as: 'business',
          required: businessFilter ? true : false,
          attributes: ['id', 'name', 'type'],
        },
        {
          model: Address,
          as: 'address',
          where: addressFilter ?? null,
          attributes: [],
        },
      ],
      order: [['firstName', 'ASC']],
      limit: limit,
      offset: skip,
    });

    const totalRecords = await User.count({
      include: [
        {
          model: Community,
          as: 'communities',
          where: { id: id },
        },
      ],
    });

    // Return Object
    return {
      totalRecords,
      members,
    };
  } catch (error) {
    console.log('🚀 ~ file: community.js:285 ~ error:', error);
    throw error;
  }
};

exports.deleteCommunity = async (id) => {
  try {
    await Community.destroy({
      where: {
        id: id,
      },
    });
    return true;
  } catch (err) {
    console.log(
      '🚀 ~ file: community.js:270 ~ exports.deleteCommunity ~ err:',
      err
    );
    throw err;
  }
};
