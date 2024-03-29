const axios = require('axios');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const { createUploader } = require('../utils/cloudinary');
const config = require('../config/config');
const { encryptPassword } = require('../utils/crypto');

const createAvatarName = async (req, file) => {
    if (file.fieldname === 'avatar') {
        const { userId } = req.user;
        return `${userId}`;
    }
};

const avatarUploader = createUploader(
    config.CLOUDINARY_AVATAR_PATH,
    createAvatarName,
);

exports.uploadAvatar = avatarUploader.fields([{ name: 'avatar', maxCount: 1 }]);

exports.getMe = (req, res, next) => {
    req.params.userId = req.user.userId;
    next();
};

exports.getMyAccount = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { user, cart } = req;
    const isLoggedIn = req.isAuthenticated();

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

exports.updateUser = catchAsync(async (req, res, next) => {
    // Create error if user PATCHes password data
    if (req.body.password) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updatePassword!',
                400,
            ),
        );
    }

    const { userId } = req.params;
    const { fullName, phoneNumber, birthday, gender, role } = req.body;

    await accountModel.updateAccount({
        userId,
        fullName,
        phoneNumber,
        birthday,
        gender: +gender,
        role: +role,
    });

    res.status(204).json();
});

exports.updateAvatar = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { avatar } = req.files;

    if (!avatar) {
        return next(new AppError('No avatar was sent!', 400));
    }

    const { path: avatarPath } = avatar[0];

    await accountModel.updateAccount({
        userId,
        avatarPath,
    });

    res.status(204).json();
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
    const { email, password, username, role } = req.body;
    const isOauth2 = false;

    // Check for username duplicated
    const account = await accountModel.getByUsername(username, true);
    if (account) {
        return next(new AppError('Username already exists.', 400));
    }

    // Check for email duplicated
    const emailAccount = await accountModel.getByEmail(email);
    if (emailAccount) {
        return next(new AppError('Email already exists.', 400));
    }

    // Encrypt password by salting and hashing
    const encryptedPassword = encryptPassword(password);

    // Create account
    await accountModel.createAccount({
        username,
        email,
        password: encryptedPassword,
        verified: 1,
        role: role || config.role.USER,
        isOauth2,
    });

    // Create bank account in bank server
    await axios.post(`${config.BANK_URL}/api/account/create-account`, {
        username,
        password: encryptedPassword,
        isOauth2,
    });

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
