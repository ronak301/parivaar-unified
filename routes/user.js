const router = require('express').Router();
const {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
} = require('../controllers/user');

router.get('/all', getUsersController);
router.get('/:id', getUserByIdController);
router.post('/new', createUserController);
router.put('/:id', updateUserController);

module.exports = router;
