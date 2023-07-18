const router = require('express').Router();
const {
  createBusinessController,
  updateBusinessController,
  deleteBusinessController,
  getBusinessesController,
} = require('../controllers/business');

router.post('/', getBusinessesController);
router.post('/create', createBusinessController);
router.put('/:id', updateBusinessController);
router.delete('/delete/:id', deleteBusinessController);

module.exports = router;
