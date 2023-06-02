const { Router } = require('express');
const ProductBookingsController = require('controllers/MonsantoProductBookingsController');
const { check } = require('express-validator/check');
const getMonsantoId = require('middleware/getMonsantoId');

const router = (module.exports = Router());

// router.post('/',
//   ProductBookingsController.create
// )
router.get('/:id/summary', getMonsantoId, ProductBookingsController.summary);

router.post('/', getMonsantoId, ProductBookingsController.create);
// router.post("/", ProductBookingsController.create);

router.patch('/:id', getMonsantoId, ProductBookingsController.edit);
