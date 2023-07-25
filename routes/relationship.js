const {
  createRelativeController,
  createRelationController,
  deleteRelationController,
} = require('../controllers/relationship');

const router = require('express').Router();

router.param('id', function (req, res, next, id) {
  if (!id || isNaN(id)) {
    res
      .status(400)
      .json({ success: false, error: 'ID parameter is missing in the route.' });
  } else {
    next();
  }
});

router.post('/relative/new', createRelativeController);
router.post('/relation/new', createRelationController);
router.delete('/delete/:id', deleteRelationController);

module.exports = router;
