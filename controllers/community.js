const {
  addCommunityMember,
  getCommunityWithAll,
  insertCommunity,
  getCommunityMembers,
} = require('../services/community');

const createCommunity = async (req, res) => {
  try {
    const newcommunity = await insertCommunity(req.body);

    res.json(newcommunity);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
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

const getCommunityWithAllController = async (req, res) => {
  const { id } = req.params;

  const members = await getCommunityWithAll(id);

  res.json(members);
};

const getCommunityMembersController = async (req, res) => {
  const { id } = req.params;
  const { skip, limit } = req.body;

  try {
    const members = await getCommunityMembers({ id, skip, limit });
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
  getCommunityWithAllController,
  joinCommunity,
  getCommunityMembersController,
};
