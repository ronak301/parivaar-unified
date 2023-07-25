const router = require('express').Router();
const {
  createCommunity,
  joinCommunity,
  getCommunityWithAllController,
  getCommunityMembersController,
  getAllCommunitiesController,
  updateCommunityController,
  deleteCommunityController,
  deleteCommunityMemberController,
} = require('../controllers/community');

router.param('id', function (req, res, next, id) {
  if (!id || isNaN(id)) {
    res
      .status(400)
      .json({ success: false, error: 'ID parameter is missing in the route.' });
  } else {
    next();
  }
});

router.get('/all', getAllCommunitiesController);
router.delete('/delete/:id', deleteCommunityController);
router.post('/create', createCommunity);
router.post('/join/:id', joinCommunity);
router.post('/members/:id', getCommunityMembersController);
router.delete('/member/delete', deleteCommunityMemberController);
router.put('/:id', updateCommunityController);
router.get('/:id', getCommunityWithAllController);

module.exports = router;
