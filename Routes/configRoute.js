const express = require('express');
const router = express.Router();
const configController = require('../Controllers/configController')


router.get('/getConfig',configController.getConfigDetails);

module.exports = router
