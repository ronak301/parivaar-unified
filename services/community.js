const CommunityMembers = require('../models/CommunityMembers');
const User = require('../models/User');
const Community = require('../models/community');

exports.addCommunityMember = async (c_id, u_id) => {
  try {
    await CommunityMembers.create({
      community_id: c_id,
      user_id: u_id,
    });
  } catch (err) {
    console.log(err);
    // throw { message: 'Error joining community' };
    throw err;
  }
};

exports.getCommunityMembers = async (c_id) => {
  try {
    const members = await Community.findByPk(c_id, {
      include: [
        {
          model: User,
          through: {
            model: CommunityMembers,
            attributes: [],
          },
          as: 'members',
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
