const express = require('express');

const authController = require('../controllers/authController');
const checkout = require('../controllers/checkoutController');

const router = express.Router();

router.post('/notifyMomo', checkout.notifyMomo);

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/notifyPaypal', checkout.notifyPaypal);
router.post('/voucher', checkout.addVoucher, checkout.getPrice);
router.delete('/initialOrders', checkout.deleteInitialOrders);
router.post('/', checkout.createInitialOrder, checkout.getOrder);
router
    .route('/:orderId')
    .get(checkout.getOrder)
    .patch(checkout.updateCheckout, checkout.getPrice)
    .post(checkout.placeOrder);

module.exports = router;
