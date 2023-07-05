const router = require('express').Router();
const {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  searchUserController,
  getUserCommunityController,
} = require('../controllers/user');

router.post('/new', createUserController);
router.get('/communities/:id', getUserCommunityController);
router.get('/all', getUsersController);
router.post('/search', searchUserController);
router.put('/:id', updateUserController);
router.get('/:id', getUserByIdController);

module.exports = router;
