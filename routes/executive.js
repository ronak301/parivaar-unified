const {
  createExecutiveController,
  addRoleController,
  deleteExecutiveController,
  updateExecutiveController,
} = require('../controllers/executive');
const executiveAuth = require('../middlewares/executiveAuth');

const router = require('express').Router();

router.post('/create', createExecutiveController);
router.post('/role/add', addRoleController);
router.put('/:id', updateExecutiveController);
router.delete('/delete/:id', deleteExecutiveController);

module.exports = router;
