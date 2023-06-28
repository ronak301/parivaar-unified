const {
  createRelative,
  createRelation,
} = require('../controllers/relationship');

const router = require('express').Router();

router.post('/relative/new', createRelative);
router.post('/relation/new', createRelation);

module.exports = router;
