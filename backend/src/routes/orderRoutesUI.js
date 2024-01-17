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
router.post('/buyAgain', orderController.buyAgain);
router
    .route('/:orderId')
    .get(orderController.getThisOrder)
    .patch(orderController.updateState);

module.exports = router;
