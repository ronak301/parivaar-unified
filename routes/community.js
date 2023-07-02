const router = require('express').Router();
const {
  createCommunity,
  joinCommunity,
  getCommunityWithAllController,
  getCommunityMembersController,
  getAllCommunitiesController,
} = require('../controllers/community');

router.get('/:id', getCommunityWithAllController);
router.post('/create', createCommunity);
router.post('/join/:id', joinCommunity);
router.get('/all', getAllCommunitiesController);
router.get('/members/:id', getCommunityMembersController);

module.exports = router;
