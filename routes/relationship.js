const {
  createRelativeController,
  createRelationController,
  deleteRelationController,
} = require('../controllers/relationship');

const router = require('express').Router();

router.post('/relative/new', createRelativeController);
router.post('/relation/new', createRelationController);
router.delete('/delete/:id', deleteRelationController);

module.exports = router;
