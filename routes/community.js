const router = require('express').Router();
const {
  createCommunity,
  joinCommunity,
  getCommunityWithAllController,
  getCommunityMembersController,
  getAllCommunitiesController,
} = require('../controllers/community');

router.get('/all', getAllCommunitiesController);
router.post('/create', createCommunity);
router.post('/join/:id', joinCommunity);
router.get('/members/:id', getCommunityMembersController);
router.get('/:id', getCommunityWithAllController);

module.exports = router;
