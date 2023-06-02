const { Router } = require('express');
const SyncController = require('controllers/MonsantoSyncController');
// const { check } = require("express-validator/check");

const router = (module.exports = Router());

router.get('/inventory', SyncController.checkInventory);
router.get('/syncProductBookingSummary', SyncController.syncProductBookingSummary);
router.get('/fetchQtyProductBookingSummary', SyncController.fetchQtyProductBookingSummary);
