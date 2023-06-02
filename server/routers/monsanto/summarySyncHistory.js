const { Router } = require('express');
const SummarySyncHistoryController = require('controllers/MonsantoSummarySyncHistoryController');

const router = (module.exports = Router());

router.get('/list', SummarySyncHistoryController.list);
router.post('/update_is_changed', SummarySyncHistoryController.updateIsChange);
