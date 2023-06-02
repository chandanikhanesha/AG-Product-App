const { Router } = require('express');
const OrderResponseLogController = require('controllers/MonsantoOrderResponseLogController');
const { check } = require('express-validator/check');

const router = (module.exports = Router());

router.get(
  '/',
  check('seedCompanyId').exists(),
  check('from').exists(),
  check('to').exists(),
  OrderResponseLogController.list,
);
router.get('/list', OrderResponseLogController.listAll);
