const { createRelative } = require('../controllers/relationship');

const router = require('express').Router();

router.post('/create', createRelative);

module.exports = router;
