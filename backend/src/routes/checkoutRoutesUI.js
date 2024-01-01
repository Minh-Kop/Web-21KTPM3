const express = require('express');

const checkoutController = require('../controllers/checkoutControllerUI');

const router = express.Router();

router.get('/', checkoutController.getCheckoutPage);

module.exports = router;
