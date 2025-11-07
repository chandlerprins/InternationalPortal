const express = require('express')

const testController = require('../controllers/testController.js')

const router = express.Router();


router.get('/healthCheck', testController.healthCheck)

module.exports = router
