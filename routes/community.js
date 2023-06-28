const router = require('express').Router();
const {
  createCommunity,
  joinCommunity,
  getCommunityWithAllController,
  getCommunityMembersController,
} = require('../controllers/community');

router.post('/create', createCommunity);
router.post('/join/:id', joinCommunity);
router.get('/members/:id', getCommunityMembersController);
router.get('/:id', getCommunityWithAllController);

module.exports = router;
