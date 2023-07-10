const {
  createExecutiveController,
  addRoleController,
} = require('../controllers/executive');
const executiveAuth = require('../middlewares/executiveAuth');

const router = require('express').Router();

router.post('/create', createExecutiveController);
router.post('/role/add', addRoleController);
router.get('/check', executiveAuth, (req, res) => {
  res.send('Hello World');
});

module.exports = router;
