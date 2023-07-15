const {
  createExecutiveController,
  addRoleController,
  deleteExecutiveController,
} = require('../controllers/executive');
const executiveAuth = require('../middlewares/executiveAuth');

const router = require('express').Router();

router.post('/create', createExecutiveController);
router.post('/role/add', addRoleController);
router.delete('/delete/:id', deleteExecutiveController);

module.exports = router;
