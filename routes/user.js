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

router.post('/new', createUserController);
router.get('/events', getUserEventsController);
router.post('/check/superadmin', checkSuperAdminController);
router.delete('/delete/:id', deleteUserController);
router.get('/communities/:id', getUserCommunityController);
router.get('/all', getUsersController);
router.post('/search', searchUserController);
router.put('/:id', updateUserController);
router.get('/:id', getUserByIdController);

module.exports = router;
