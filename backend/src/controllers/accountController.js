// const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const { createUploader } = require('../utils/cloudinary');
const config = require('../config');
const { encryptPassword } = require('../utils/crypto');

const createAvatarName = async (req, file) => {
    if (file.fieldname === 'avatar') {
        const { email } = req.user;
        return `${email}`;
    }
};

const avatarUploader = createUploader(
    config.CLOUDINARY_AVATAR_PATH,
    createAvatarName,
);

exports.uploadAvatar = avatarUploader.fields([{ name: 'avatar', maxCount: 1 }]);

exports.getMe = (req, res, next) => {
    req.params.email = req.user.email;
    next();
};

exports.getUser = catchAsync(async (req, res, next) => {
    const { email } = req.params;
    const { year } = req.query;
    const userEntity = {
        email,
        year: +year || new Date().getFullYear(),
    };

    const detailedUser = await accountModel.getDetailedUser(userEntity);

    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }

    res.status(200).json({
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

    const { email } = req.params;
    const { fullName, phoneNumber, birthday, gender, tier, role } = req.body;
    const userEntity = {
        email,
        fullName,
        phoneNumber,
        birthday,
        gender: +gender,
        tier: +tier,
        role: +role,
    };

    await accountModel.updateAccount(userEntity);

    res.status(200).json({
        status: 'success',
        email,
    });
});

exports.updateAvatar = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const { path: avatarPath, filename: avatarFilename } = req.files.avatar[0];
    const userEntity = {
        email,
        avatarPath,
        avatarFilename,
    };

    await accountModel.updateAccount(userEntity);

    res.status(200).json({
        status: 'success',
        email,
    });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const { sortType } = req.query;
    let { year, tier, limit, page } = req.query;

    year = +year || new Date().getFullYear();
    tier = +tier;
    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    const userEntity = {
        year,
        tier,
        sortType,
        limit,
        offset,
    };

    const users = await accountModel.getAllUsers(userEntity);

    res.status(200).json({
        status: 'success',
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
