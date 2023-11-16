const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const shippingAddressModel = require('../models/shippingAddressModel');

exports.getShippingAddresses = catchAsync(async (req, res, next) => {
    const { email } = req.user;

    const shippingAddresses =
        await shippingAddressModel.getShippingAddressesByEmail(email);
    res.status(200).json({
        status: 'success',
        length: shippingAddresses.length,
        shippingAddresses,
    });
});

exports.createShippingAddress = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const {
        provId,
        distId,
        wardId,
        address,
        fullName,
        phoneNumber,
        isDefault,
        lat,
        lng,
    } = req.body;

    const result = await shippingAddressModel.createShippingAddress({
        email,
        address,
        wardId,
        distId,
        provId,
        fullName,
        phoneNumber,
        isDefault: isDefault || 0,
        lat,
        lng,
    });
    if (!result) {
        return next(new AppError('Create address failed.', 400));
    }
    res.status(200).json({
        status: 'success',
    });
});

exports.updateShippingAddress = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const { addrId } = req.params;
    const {
        provId,
        distId,
        wardId,
        address,
        fullName,
        phoneNumber,
        isDefault,
        lat,
        lng,
    } = req.body;

    const result = await shippingAddressModel.updateShippingAddress({
        email,
        addrId,
        address,
        wardId,
        distId,
        provId,
        fullName,
        phoneNumber,
        isDefault,
        lat,
        lng,
    });
    if (result <= 0) {
        return next(new AppError('Shipping address not found.', 404));
    }
    res.status(200).json({
        status: 'success',
    });
});

exports.deleteShippingAddress = catchAsync(async (req, res, next) => {
    const { addrId } = req.params;

    const result = await shippingAddressModel.deleteShippingAddress(addrId);
    if (result <= 0) {
        return next(new AppError('Shipping address not found.', 404));
    }
    res.status(200).json({
        status: 'success',
    });
});
