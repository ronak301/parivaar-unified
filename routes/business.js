const router = require('express').Router();
const {
  createBusinessController,
  getBusinessController,
} = require('../controllers/business');

router.get('/', getBusinessController);
router.post('/create', createBusinessController);
// router.delete('/delete', deleteBusiness);

module.exports = router;
