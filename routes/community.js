const router = require('express').Router();
const {
  createCommunity,
  joinCommunity,
  getCommunityWithAllController,
  getCommunityMembersController,
  getAllCommunitiesController,
  updateCommunityController,
  deleteCommunityController,
} = require('../controllers/community');

router.get('/all', getAllCommunitiesController);
router.delete('/delete/:id', deleteCommunityController);
router.post('/create', createCommunity);
router.post('/join/:id', joinCommunity);
router.get('/members/:id', getCommunityMembersController);
router.put('/:id', updateCommunityController);
router.get('/:id', getCommunityWithAllController);

module.exports = router;
