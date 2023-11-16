const express = require('express');

const config = require('../config');
const voucherController = require('../controllers/voucherController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/user').get(voucherController.getAllUserVouchers);
router.route('/order').get(voucherController.getVouchersByOrderId);

// Restrict all routes to only role admin after this middleware
router.use(authController.restrictTo(config.role.ADMIN));

router
    .route('/')
    .get(voucherController.getAllVouchers)
    .post(voucherController.createVoucher);

router.route('/:voucherId').delete(voucherController.deleteVoucher);

module.exports = router;
