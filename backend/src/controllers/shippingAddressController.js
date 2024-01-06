const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const shippingAddressModel = require('../models/shippingAddressModel');
const { getCoordinateUI } = require('./locationController');

exports.getShippingAddresses = catchAsync(async (req, res, next) => {
    const { userId } = req.user;

    const shippingAddresses =
        await shippingAddressModel.getAllShippingAddressesByUserId(userId);
    res.status(200).json({
        status: 'success',
        length: shippingAddresses.length,
        shippingAddresses,
    });
});

exports.createShippingAddress = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const {
        provId,
        distId,
        wardId,
        address,
        fullName,
        phoneNumber,
        isDefault,
    } = req.body;

    const { lat, lng } = await getCoordinateUI({
        address,
        wardId,
        distId,
        provId,
    });

    const result = await shippingAddressModel.createShippingAddress({
        userId,
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
    const { userId } = req.user;
    const { addrId } = req.params;
    const { isDefault } = req.body;
    const result = await shippingAddressModel.updateShippingAddress({
        userId,
        addrId,
        isDefault,
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
