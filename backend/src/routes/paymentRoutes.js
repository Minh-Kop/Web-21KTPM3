const express = require('express');

const payment = require('../controllers/paymentController');

const router = express.Router();

router.get('/', payment.getPayments);

module.exports = router;
