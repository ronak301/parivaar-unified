const router = require('express').Router();
const {
  createBusinessController,
  getBusinessController,
  updateBusinessController,
} = require('../controllers/business');

router.get('/', getBusinessController);
router.post('/create', createBusinessController);
router.put('/:id', updateBusinessController);
// router.delete('/delete', deleteBusiness);

module.exports = router;
