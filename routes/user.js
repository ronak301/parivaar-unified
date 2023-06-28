const router = require('express').Router();
const { createUser, getUsers, getUserById } = require('../controllers/user');

router.get('/all', getUsers);
router.get('/:id', getUserById);
router.post('/new', createUser);

module.exports = router;
