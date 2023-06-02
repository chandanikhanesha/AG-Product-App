const { Router } = require('express');
const ShipNoticeController = require('controllers/MonsantoShipNoticeController');
const { check } = require('express-validator/check');

const router = (module.exports = Router());

router.post('/ship_notice', ShipNoticeController.shipNoticeList);
router.get('/list', ShipNoticeController.list);

router.post('/update_accept_status', ShipNoticeController.updateAcceptStatus);
