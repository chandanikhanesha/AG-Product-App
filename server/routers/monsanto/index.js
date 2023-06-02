const { Router } = require('express');
const authMiddleware = require('middleware/userAuth');
const requiredFieldsValidator = require('middleware/requiredFieldsValidator');

const productsRouter = require('routers/monsanto/products');
const customerProductsRouter = require('routers/monsanto/customerProducts');
const growerLicenceRouter = require('routers/monsanto/growerLicense');
const shipNoticeRouter = require('routers/monsanto/shipNotice');
const retailOrders = require('routers/monsanto/retailOrders');
const priceSheetRouter = require('routers/monsanto/pricesheet');
const productAvailability = require('routers/monsanto/productAvailability');
const orderResponseLog = require('routers/monsanto/orderResponseLog');
const productBooking = require('routers/monsanto/productBooking');
const productMovementReport = require('controllers/productMovementReport');
const productMovementReportAll = require('controllers/productMovementReportAll');

const summarySyncHistory = require('routers/monsanto/summarySyncHistory');
const syncRouter = require('routers/monsanto/sync');
const monsantoFavoriteController = require('controllers/MonsantoFavoriteProductController');

const router = (module.exports = Router().use(authMiddleware));

router.use('/products', productsRouter);
router.use('/customer_products', customerProductsRouter);

router.use('/grower_licence', growerLicenceRouter);
router.use('/ship_notice', shipNoticeRouter);
router.use('/retailer_orders', retailOrders);
router.use('/product_availability', productAvailability);
router.use('/order_response_log', orderResponseLog);
router.use('/product_booking', requiredFieldsValidator, productBooking);
router.use('/pricesheet', priceSheetRouter);
router.use('/sync', syncRouter);
router.use('/monsanto_favorite_products', monsantoFavoriteController);
router.use('/product_movement_report', productMovementReport);
router.use('/syncAllGPOS', productMovementReportAll);

router.use('/summary_sync_history', summarySyncHistory);
