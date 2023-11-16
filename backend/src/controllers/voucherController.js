const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const voucherModel = require('../models/voucherModel');
const { buildVoucherTree, buildOrderVoucherTree } = require('../utils/voucher');

exports.getAllVouchers = catchAsync(async (req, res, next) => {
    const result = await voucherModel.getAllVouchers();
    const vouchers = result.map((item) => ({
        ...item,
        startDate: moment(item.startDate)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY'),
        endDate: moment(item.endDate).subtract(7, 'hours').format('DD/MM/YYYY'),
    }));
    const voucherTypes = buildVoucherTree(vouchers);
    res.status(200).json({
        status: 'success',
        length: voucherTypes.length,
        voucherTypes,
    });
});

exports.getVoucherByCode = catchAsync(async (req, res, next) => {
    const { email } = req.payload;
    const { voucherId } = req.params;
    const result = await voucherModel.getVoucherByCodeEmail(voucherId, email);
    if (result === null) {
        return res.status(200).send({
            exitcode: 101,
            message: 'Voucher not found',
        });
    }
    const voucher = {
        voucherId: result.voucher_code,
        percentageDiscount: result.percentage_discount,
        minimumPrice: result.minimum_price,
        maximumDiscountPrice: result.maximum_discount_price,
        startDate: moment(new Date(result.start_date)).format('DD/MM/YYYY'),
        endDate: moment(new Date(result.end_date)).format('DD/MM/YYYY'),
    };
    res.status(200).send({
        exitcode: 0,
        message: 'Get vouchers successfully',
        voucher: voucher,
    });
});

exports.createVoucher = catchAsync(async (req, res, next) => {
    const {
        voucherTypeId,
        percentageDiscount,
        minPrice,
        maxDiscountPrice,
        startDate,
        endDate,
        maxAmount,
    } = req.body;

    const result = await voucherModel.createVoucher({
        voucherTypeId,
        percentageDiscount: percentageDiscount || null,
        minPrice,
        maxDiscountPrice,
        startDate: moment(startDate || new Date(), 'DD/MM/YYYY').format(),
        endDate: moment(endDate, 'DD/MM/YYYY').format(),
        maxAmount,
    });

    if (!result) {
        return next(new AppError('Created failed.', 400));
    }
    res.status(200).json({
        status: 'success',
    });
});

exports.deleteVoucher = catchAsync(async (req, res, next) => {
    const { voucherId } = req.params;
    const result = await voucherModel.deleteVoucher(voucherId);
    if (result > 0) {
        res.status(200).json({
            status: 'success',
        });
    }
    return next(new AppError('Voucher not found.', 404));
});

exports.getAllUserVouchers = catchAsync(async (req, res, next) => {
    const { email } = req.user;

    const result = await voucherModel.getAllUserVouchers(email);
    const vouchers = result.map((item) => ({
        ...item,
        startDate: moment(item.startDate)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY'),
        endDate: moment(item.endDate).subtract(7, 'hours').format('DD/MM/YYYY'),
    }));

    const voucherTypes = buildVoucherTree(vouchers);
    res.status(200).json({
        status: 'success',
        length: voucherTypes.length,
        voucherTypes,
    });
});

exports.getVouchersByOrderId = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const { orderId } = req.query;

    // Get order vouchers
    const orderVouchers = await voucherModel.getVouchersByOrderId(orderId);
    if (!orderVouchers.length) {
        return next(new AppError("This order doesn't have any vouchers.", 400));
    }

    // Get user vouchers
    let userVouchers = await voucherModel.getAllUserVouchers(email);
    userVouchers = userVouchers.map((item) => ({
        ...item,
        startDate: moment(item.startDate)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY'),
        endDate: moment(item.endDate).subtract(7, 'hours').format('DD/MM/YYYY'),
    }));

    // Create voucher tree from orderVouchers and userVouchers
    const voucherTypes = buildOrderVoucherTree(userVouchers, orderVouchers);
    res.status(200).json({
        status: 'success',
        length: voucherTypes.length,
        voucherTypes,
    });
});
