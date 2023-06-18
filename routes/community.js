const router = require('express').Router();
const {
  createCommunity,
  joinCommunity,
  getCommunityWithMembersController,
} = require('../controllers/community');

router.post('/create', createCommunity);
router.post('/join/:id', joinCommunity);
router.get('/members/:id', getCommunityWithMembersController);

module.exports = router;
