const { updateAddressController } = require('../controllers/address');

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

router.put('/:id', updateAddressController);

module.exports = router;
