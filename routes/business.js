const router = require('express').Router();
const {
  createBusinessController,
  getBusinessController,
  updateBusinessController,
  deleteBusinessController,
} = require('../controllers/business');

router.get('/', getBusinessController);
router.post('/create', createBusinessController);
router.put('/:id', updateBusinessController);
router.delete('/delete/:id', deleteBusinessController);

module.exports = router;
