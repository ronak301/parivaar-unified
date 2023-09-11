const { Sequelize, Op } = require('sequelize');
const {
  User,
  Community,
  CommunityMember,
  Executive,
  Address,
} = require('../models');
const Business = require('../models/Business');

exports.insertCommunity = async (data) => {
  try {
    const community = await Community.create(data);
    return community;
  } catch (err) {
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

  let ageFilter = userFilter.age ?? {};
  let minDob, maxDob;

  if (Object.keys(ageFilter).length > 0) {
    const currentDate = new Date();
    minDob = new Date(
      currentDate.getFullYear() - ageFilter.min,
      currentDate.getMonth(),
      currentDate.getDate()
    );
    maxDob = new Date(
      currentDate.getFullYear() - ageFilter.max - 1,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    ageFilter = {
      dob: {
        [Op.gte]: maxDob,
        [Op.lte]: minDob,
      },
    };

    delete userFilter.age;
  }

  // const ageFilter = userFilter.age;

  // const currentDate = new Date();
  // const minDob = new Date(
  //   currentDate.getFullYear() - ageFilter.min,
  //   currentDate.getMonth(),
  //   currentDate.getDate()
  // );
  // const maxDob = new Date(
  //   currentDate.getFullYear() - ageFilter.max - 1,
  //   currentDate.getMonth(),
  //   currentDate.getDate()
  // );

  // delete userFilter.age;

  try {
    const members = await User.findAndCountAll({
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
          ageFilter,
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
        'guardianName',
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
      order: [
        ['firstName', 'ASC'],
        ['lastName', 'ASC'],
      ],
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
    throw err;
  }
};
