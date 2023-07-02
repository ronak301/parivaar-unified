const { Sequelize } = require('sequelize');
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
          'total_members',
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
    console.log(err);
    throw err;
  }
};

exports.getCommunityWithAll = async (c_id) => {
  try {
    const members = await Community.findByPk(c_id, {
      include: [
        // {
        //   model: User,
        //   as: 'members',
        //   through: {
        //     model: CommunityMember,
        //     attributes: [],
        //   },
        //   as: 'members',
        //   attributes: ['firstName', 'lastName'],
        // },
        {
          model: User,
          as: 'executives',
          through: {
            model: Executive,
            attributes: [],
          },
          attributes: ['firstName', 'lastName'],
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

exports.getCommunityMembers = async ({ id, filter, skip, limit }) => {
  try {
    const members = await User.findAll({
      where: filter,
      attributes: [
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
          attributes: ['name', 'type'],
        },
      ],
      limit: limit,
      offset: skip,
    });

    // count members in the community for pagination
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
    console.error(error);
    throw error;
  }
};
