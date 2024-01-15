const axios = require('axios');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const { createUploader } = require('../utils/cloudinary');
const config = require('../config/config');
const bankUrl = config.BANK_URL;
const {
    verifyPassword,
    encryptPassword,
    generateToken,
} = require('../utils/crypto');
const moment = require('moment');
const { getVerifyEmail, createTransport } = require('../utils/nodemailer');

const createSignUpMail = async (email, webUrl) => {
    // 256 bits which provides about 1e+77 possible different number
    // This is enough for preventing brute force
    const verifyToken = generateToken(config.NUMBER_BYTE_VERIFY_TOKEN);

    // Send each mail with different time to prevent the html being trimmed by Gmail
    const url = `${webUrl}/api/user`;
    const mailOption = getVerifyEmail(email, url, verifyToken);
    const transport = await createTransport();
    await transport.sendMail(mailOption);

    return verifyToken;
};

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
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();

    const detailedUser = await accountModel.getDetailedUser(userId);

    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }
    detailedUser.recordset[0].birthday = moment(
        detailedUser.recordset[0].birthday,
    )
        .subtract(7, 'hours')
        .format('YYYY-MM-DD');

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
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { user } = req;
    const detailedUser = await accountModel.getDetailedUser(userId);

    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }

    detailedUser.recordset[0].birthday = moment(
        detailedUser.recordset[0].birthday,
    )
        .subtract(7, 'hours')
        .format('YYYY-MM-DD');
    res.render('account/crud_user_detail', {
        title: 'Chi tiết tài khoản',
        navbar: () => 'empty',
        footer: () => 'empty',
        status: 'success',
        user: detailedUser.recordset[0],
        ...user,
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
    const { path: avatarPath } = req.files.avatar[0];

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

    const tempUsers = await accountModel.getAllUsers({
        sortType,
        limit,
        offset,
    });
    const users = tempUsers.map((el) => ({
        ...el,
        birthday: moment(el.birthday).subtract(7, 'hours').format('DD/MM/YYYY'),
        avatarPath: el.avatarPath || '/assets/img/account_icon.svg',
    }));
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';
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

    // Send mail
    const webUrl = `${req.protocol}://${req.get('host')}`;
    const verifyToken = await createSignUpMail(email, webUrl);

    // Encrypt password by salting and hashing
    const encryptedPassword = encryptPassword(password);

    // Create account
    await accountModel.createAccount({
        username,
        email,
        password: encryptedPassword,
        verified: 1,
        token: verifyToken,
        role: role || config.role.USER,
        isOauth2,
    });

    // Create bank account in bank server
    await axios.post(`${bankUrl}/api/account/create-account`, {
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

exports.getCreateUserPage = catchAsync(async (req, res, next) => {
    res.render('account/crud_add_user', {
        title: 'Thêm user',
        navbar: () => 'empty',
        footer: () => 'empty',
    });
});
