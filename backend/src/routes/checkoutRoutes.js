const express = require('express');

const authController = require('../controllers/authController');
const checkout = require('../controllers/checkoutController');

const router = express.Router();

router.post('/notifyMomo', checkout.notifyMomo);

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/notifyPaypal', checkout.notifyPaypal);
router.post('/', checkout.checkout);
router.route('/:orderId').post(checkout.placeOrder);

module.exports = router;
