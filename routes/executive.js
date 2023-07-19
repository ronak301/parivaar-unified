const {
  createExecutiveController,
  addRoleController,
  deleteExecutiveController,
  updateExecutiveController,
  checkAdminController,
} = require('../controllers/executive');
const executiveAuth = require('../middlewares/executiveAuth');

const router = require('express').Router();

router.post('/create', createExecutiveController);
router.post('/role/add', addRoleController);
router.post('/check/admin', checkAdminController);
router.put('/:id', updateExecutiveController);
router.delete('/delete/:id', deleteExecutiveController);

module.exports = router;
