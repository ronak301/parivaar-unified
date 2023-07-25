const router = require('express').Router();
const {
  createBusinessController,
  updateBusinessController,
  deleteBusinessController,
  getBusinessesController,
} = require('../controllers/business');

router.param('id', function (req, res, next, id) {
  if (!id || isNaN(id)) {
    res
      .status(400)
      .json({ success: false, error: 'ID parameter is missing in the route.' });
  } else {
    next();
  }
});

router.post('/', getBusinessesController);
router.post('/new', createBusinessController);
router.put('/:id', updateBusinessController);
router.delete('/delete/:id', deleteBusinessController);

module.exports = router;
