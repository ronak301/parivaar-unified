const router = require('express').Router();
const {
  createBusiness,
  getBusiness,
  deleteBusiness,
} = require('../controllers/business');

router.get('/', getBusiness);
router.post('/create', createBusiness);
router.delete('/delete', deleteBusiness);

module.exports = router;
