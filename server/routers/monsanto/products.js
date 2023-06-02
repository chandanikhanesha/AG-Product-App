const { Router } = require('express');
const ProductsController = require('controllers/MonsantoProductsController');
const { check } = require('express-validator/check');

const router = (module.exports = Router());

router.get('/', check('cropType').exists(), check('seedCompanyId').exists(), ProductsController.list);

router.get('/last_update', ProductsController.getLastUpdate);

router.patch('/update_monsanto_lot/', ProductsController.updateMonsantoProduct);

// router.post('/add_packaging_products', ProductsController.addPackagingProducts);

router.get('/packaging_products', ProductsController.listPackagingProducts);
