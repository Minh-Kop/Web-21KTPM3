// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const paymentModel = require('../models/paymentModel');

exports.getPayments = catchAsync(async (req, res, next) => {
    const payments = await paymentModel.getPayments();
    res.status(200).json({
        status: 'success',
        length: payments.length,
        payments,
    });
});
