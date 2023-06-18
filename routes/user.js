const router = require('express').Router();
const { createUser, getUsers, getUserById } = require('../controllers/user');

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/create', createUser);

module.exports = router;
