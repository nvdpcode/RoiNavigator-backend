const express = require('express');
const router = express.Router();
const productController = require('../Controllers/prodController')
const calculationController = require('../Controllers/calculationController')


router.post('/addEnv',productController.addProductEnvDetails);
router.post('/additionals',productController.addProductAddidtionals)
router.post('/phase',productController.addProductPhaseDetails)
router.post('/calculation',calculationController.calculation)
router.post('/calcDetails',calculationController.getCalculations)
router.post('/calcTimeline',calculationController.calculationTimeline)


module.exports = router
