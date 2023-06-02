const { Router } = require('express');
const RetailOrdersController = require('controllers/MonsantoRetailOrdersController');

const router = (module.exports = Router());

router.get('/summary', RetailOrdersController.summary);
router.get('/allSummary/:seedCompanyId', RetailOrdersController.allSummary);

router.get('/syncSummaryData', RetailOrdersController.syncSummaryData);
router.get('/custometestsummary', RetailOrdersController.custometestsummary);
router.post('/setQuantity', RetailOrdersController.setQuantity);
router.get('/bayer_order_check', RetailOrdersController.bayer_order_check);

// router.post("/sync", RetailOrdersController.sync);
router.get('/last_update', RetailOrdersController.getLastUpdate);
