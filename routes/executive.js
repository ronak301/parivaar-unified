const {
  createExecutiveController,
  addRoleController,
  deleteExecutiveController,
  updateExecutiveController,
  checkAdminController,
} = require('../controllers/executive');
const executiveAuth = require('../middlewares/executiveAuth');

const router = require('express').Router();

router.param('id', function (req, res, next, id) {
  if (!id || isNaN(id)) {
    res
      .status(400)
      .json({ success: false, error: 'ID parameter is missing in the route.' });
  } else {
    next();
  }
});

router.post('/create', createExecutiveController);
router.post('/role/add', addRoleController);
router.post('/check/admin', checkAdminController);
router.put('/:id', updateExecutiveController);
router.delete('/delete/:id', deleteExecutiveController);

module.exports = router;
