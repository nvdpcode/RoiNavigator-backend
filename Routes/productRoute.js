const express = require('express');
const router = express.Router();
const productController = require('../Controllers/prodController')
const calculationController = require('../Controllers/calculationController')
const timelineController =  require('../Controllers/timelineController')


router.post('/addEnv',productController.addProductEnvDetails);
router.post('/additionals',productController.addProductAddidtionals)
router.post('/phase',productController.addProductPhaseDetails)
router.post('/calculation',calculationController.calculation)
router.post('/calcDetails',calculationController.getCalculations)
router.post('/calcTimeline',timelineController.calculationTimeline)
router.post('/roi',timelineController.roiBenefits)


module.exports = router
