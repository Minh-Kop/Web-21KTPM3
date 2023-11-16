const express = require('express');

const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');
const config = require('../config');

const router = express.Router();

router.get(
    '/user',
    authController.restrictTo(config.role.ADMIN),
    orderController.getUserOrders,
);

router.get('/me', orderController.getMe, orderController.getUserOrders);
router.post('/buyAgain', orderController.buyAgain);
router
    .route('/:orderId')
    .get(orderController.getOrder)
    .patch(orderController.updateState);

// Restrict all routes to only role admin after this middleware
router.use(authController.restrictTo(config.role.ADMIN));

router.get('/', orderController.getAllOrders);

module.exports = router;
