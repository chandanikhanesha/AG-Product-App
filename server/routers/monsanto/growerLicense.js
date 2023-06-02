const { Router } = require('express');
const GrowerLicenceController = require('controllers/MonsantoGrowerLicenceController');
const { check } = require('express-validator/check');

const router = (module.exports = Router());

router.post('/check', GrowerLicenceController.check);
router.post('/addGrower', GrowerLicenceController.addGrower);
