const { Router } = require('express');
const {
  fetchPriceSheet,
  getZoneIds,
  requestPriceSheet,
  addZoneId,
  deleteZoneId,
  getPriceSheet,
  patchPriceSheet,
  syncLatestPricesheets,
} = require('controllers/MonsantoPriceSheetController');
// const {check} = require('express-validator/check')

const router = (module.exports = Router());

router.get('/', getZoneIds);
router.get('/getPriceSheet', getPriceSheet);
router.patch('/patchPriceSheet', patchPriceSheet);
router.post('/sync', fetchPriceSheet);
router.post('/requestPriceSheet', requestPriceSheet);
router.post('/addZoneId', addZoneId);
router.post('/deleteZoneId', deleteZoneId);
router.get('/synclatestPricesheets', syncLatestPricesheets);

// router.get('/last_update', ProductsController.getLastUpdate)
