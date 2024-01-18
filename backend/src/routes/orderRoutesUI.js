const express = require('express');

const orderController = require('../controllers/orderControllerUI');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

router.get(
    '/user',
    authController.restrictTo(config.role.ADMIN),
    orderController.getUserOrders,
);

router.get('/me', orderController.getMyOrders);
router.route('/:orderId').get(orderController.getThisOrder);

module.exports = router;
