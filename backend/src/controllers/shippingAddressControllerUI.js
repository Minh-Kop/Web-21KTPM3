const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const shippingAddressModel = require('../models/shippingAddressModel');
const config = require('../config/config');
const locationController = require('./locationController');
const locationModel = require('../models/locationModel');

exports.getShippingAddresses = async (userId) => {
    const shippingAddresses =
        await shippingAddressModel.getAllShippingAddressesByUserId(userId);
    return shippingAddresses;
};

exports.getMyShippingAddresses = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }
    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;
    const shippingAddresses =
        await shippingAddressModel.getAllShippingAddressesByUserId(userId);
    
    const provinces = await locationModel.getProvinces();
    res.render('account/address_list', {
        length: shippingAddresses.length,
        title: 'Sổ địa chỉ',
        shippingAddresses,
        link: newUrl,
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: url,
        categoryTree,
        isAdmin,
        provinces
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
        lat,
        lng,
    } = req.body;

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
