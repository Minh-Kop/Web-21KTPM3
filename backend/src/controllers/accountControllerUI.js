const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const config = require('../config/config');
const { encryptPassword } = require('../utils/crypto');

exports.getMyAccount = catchAsync(async (req, res, next) => {
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();

    const detailedUser = await accountModel.getDetailedUser(user.userId);
    const avatarTag = `<img src="${user.avatarPath}" class="kv-preview-data file-preview-image">`;

    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }
    detailedUser.recordset[0].birthday = new Date(
        detailedUser.recordset[0].birthday,
    )
        .toISOString()
        .split('T')[0];

    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    res.render('account/user_account', {
        title: detailedUser.recordset[0].userName,
        user: detailedUser.recordset[0],
        link: newUrl,
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: url,
        categoryTree,
        avatarTag,
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const detailedUser = await accountModel.getDetailedUser(userId);

    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }

    detailedUser.recordset[0].birthday = new Date(
        detailedUser.recordset[0].birthday,
    )
        .toISOString()
        .split('T')[0];

    res.render('account/crud_user_detail', {
        title: 'Chi tiết tài khoản',
        navbar: () => 'empty',
        footer: () => 'empty',
        status: 'success',
        user: detailedUser.recordset[0],
    });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    let { sortType, limit, page } = req.query;
    const { user } = req;
    sortType = sortType || 'userid';
    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    const users = await accountModel.getAllUsers({
        sortType,
        limit,
        offset,
    });

    users.forEach((el) => {
        el.birthday = new Date(el.birthday).toISOString().split('T')[0];
    });

    res.render('account/crud_users_list', {
        title: 'Danh sách tài khoản',
        status: 'success',
        navbar: () => 'empty',
        footer: () => 'empty',
        ...user,
        users,
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const { email, phoneNumber, password, fullName, role } = req.body;

    // Check for email duplicated
    const emailAccount = await accountModel.getByEmail(email);
    if (emailAccount) {
        return next(new AppError('Email already exists.', 400));
    }

    // Check for phone number duplicated
    const phoneNumberAccount = await accountModel.getByPhone(phoneNumber);
    if (phoneNumberAccount) {
        return next(new AppError('Phone number is already used.', 400));
    }

    // Encrypt password by salting and hashing
    const encryptedPassword = encryptPassword(password);

    // Create entity to insert to DB
    const entity = {
        email,
        phoneNumber,
        fullName,
        password: encryptedPassword,
        verified: 1,
        role: role || config.role.USER,
    };
    await accountModel.createAccount(entity);

    res.status(200).json({
        status: 'success',
        message: 'Create account successfully',
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const result = await accountModel.deleteAccount(userId);
    if (result <= 0) {
        return next(new AppError('Account not found.', 404));
    }
    res.status(200).json({
        status: 'success',
    });
});
