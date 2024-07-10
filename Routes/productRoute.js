const express = require('express');
const router = express.Router();
const productController = require('../Controllers/prodController')
const calculationController = require('../Controllers/calculationController')


router.post('/addEnv',productController.addProductEnvDetails);
router.post('/additionals',productController.addProductAddidtionals)
router.post('/phase',productController.addProductPhaseDetails)
router.get('/calculation',calculationController.calculation)
router.get('/calcDetails',calculationController.getCalculations)


module.exports = router
