const { Router } = require('express');
const ProductAvailabityController = require('controllers/MonsantoProductAvailabilityController');
const { check } = require('express-validator/check');

const router = (module.exports = Router());

router.post('/', check('CustomerMonsantoProducts').exists(), ProductAvailabityController.check);
router.post('/checkInOrder', check('CustomerMonsantoProducts').exists(), ProductAvailabityController.checkInOrder);

router.post(
  '/checkShortProduct',
  check('CustomerMonsantoProducts').exists(),
  ProductAvailabityController.checkShortProduct,
);

router.post(
  '/checkInInventory',
  check('CustomerMonsantoProducts').exists(),
  ProductAvailabityController.checkInInventory,
);
