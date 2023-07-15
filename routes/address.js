const { updateAddressController } = require('../controllers/address');

const router = require('express').Router();

router.put('/:id', updateAddressController);

module.exports = router;
