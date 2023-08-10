const router = require('express').Router();
const {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  searchUserController,
  getUserCommunityController,
  deleteUserController,
  getUserEventsController,
  checkSuperAdminController,
} = require('../controllers/user');
const authenticate = require('../middlewares/authenticate');

router.param('id', function (req, res, next, id) {
  if (!id) {
    res
      .status(400)
      .json({ success: false, error: 'ID parameter is missing in the route.' });
  } else {
    next();
  }
});

router.post('/new', createUserController);
router.get('/events/:communityId', getUserEventsController);
router.post('/check/superadmin', checkSuperAdminController);
router.delete('/delete/:id', deleteUserController);
router.get('/communities/:id', getUserCommunityController);
router.get('/all', getUsersController);
router.post('/search', searchUserController);
router.put('/:id', updateUserController);
router.get('/:id', getUserByIdController);

module.exports = router;
