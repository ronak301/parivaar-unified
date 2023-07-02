const {
  addCommunityMember,
  getCommunityWithAll,
  insertCommunity,
  getCommunityMembers,
  getCommunities,
} = require('../services/community');

const createCommunity = async (req, res) => {
  try {
    const newCommunity = await insertCommunity(req.body);

    return res.json(newCommunity);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const joinCommunity = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await addCommunityMember(id, userId);

    return res
      .status(200)
      .json({ success: true, message: 'Successfully joined community' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err });
  }
};

const getAllCommunitiesController = async (req, res) => {
  try {
    const communities = await getCommunities();
    res.json({ success: true, communities });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCommunityWithAllController = async (req, res) => {
  const { id } = req.params;

  const members = await getCommunityWithAll(id);

  res.json(members);
};

const getCommunityMembersController = async (req, res) => {
  const { id } = req.params;
  const { filter, skip, limit } = req.body;

  try {
    const members = await getCommunityMembers({ id, filter, skip, limit });
    res.json({
      success: true,
      totalMembers: members.totalRecords,
      members: members.members,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err });
  }
};

module.exports = {
  createCommunity,
  getAllCommunitiesController,
  getCommunityWithAllController,
  joinCommunity,
  getCommunityMembersController,
};
