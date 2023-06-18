const CommunityMembers = require('../models/CommunityMembers');
const Community = require('../models/community');
const {
  addCommunityMember,
  getCommunityMembers,
} = require('../services/community');

const createCommunity = async (req, res) => {
  const community = await Community.create({
    name: 'My Community 2',
    description: 'This is my community',
  });

  res.json(community);
};

const joinCommunity = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await addCommunityMember(id, userId);

    res
      .status(200)
      .json({ success: true, message: 'Successfully joined community' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err });
  }
};

const getCommunityWithMembersController = async (req, res) => {
  const { id } = req.params;

  const members = await getCommunityMembers(id);

  res.json(members);
};

module.exports = {
  createCommunity,
  getCommunityWithMembersController,
  joinCommunity,
};
