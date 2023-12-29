const express = require('express');

const cartController = require('../controllers/cartControllerUI');

const router = express.Router();

router.route('/').get(cartController.getCartPage);

module.exports = router;
