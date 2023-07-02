const router = require('express').Router();
const {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  searchUserController,
} = require('../controllers/user');

router.post('/new', createUserController);
router.get('/all', getUsersController);
router.get('/:id', getUserByIdController);
router.post('/search', searchUserController);
router.put('/:id', updateUserController);

module.exports = router;
