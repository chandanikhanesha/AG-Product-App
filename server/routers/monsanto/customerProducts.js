const { Router } = require('express');
// const { check, validationResult } = require('express-validator/check')
const authMiddleware = require('middleware/userAuth');
const getMonsantoId = require('middleware/getMonsantoId');
const CustomerMonsantoProductsController = require('controllers/CustomerMonsantoProductsController');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', CustomerMonsantoProductsController.list);

router.post(
  '/',
  // check('companyId').exists(),
  // check('organizationId').exists(),
  // check('name').exists(),
  // check('unit').exists(),
  // check('costUnit').exists(),
  // check('quantity').exists(),
  CustomerMonsantoProductsController.create,
);

router.delete('/:id', getMonsantoId, CustomerMonsantoProductsController.delete);

router.patch(
  '/:id',
  // check('companyId').exists(),
  // check('organizationId').exists(),
  // check('name').exists(),
  // check('unit').exists(),
  // check('costUnit').exists(),
  // check('quantity').exists(),
  CustomerMonsantoProductsController.update,
);

router.get('/last_update', CustomerMonsantoProductsController.getLastUpdate);
router.patch('/transfer_po/delete', CustomerMonsantoProductsController.transferPo);
router.patch('/update_quote/:id', CustomerMonsantoProductsController.updateQuote);
