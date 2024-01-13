const axios = require('axios');

const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const {
    verifyPassword,
    encryptPassword,
    generateToken,
} = require('../utils/crypto');
const { getVerifyEmail, createTransport } = require('../utils/nodemailer');

const bankUrl = config.BANK_URL;

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

exports.signUp = catchAsync(async (req, res, next) => {
    const { email, password, username } = req.body;
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
        role: config.role.USER,
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

exports.signUpForOauth2 = async (email, webUrl) => {
    // Send mail
    await createSignUpMail(email, webUrl);

    // Create account
    const username = email.substring(0, email.indexOf('@'));
    const isOauth2 = true;
    await accountModel.createAccount({
        username,
        email,
        verified: 1,
        isOauth2,
        role: config.role.USER,
    });

    // Create bank account in bank server
    await axios.post(`${bankUrl}/api/account/create-account`, {
        username,
        isOauth2,
    });

    return username;
};

exports.verify = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    const result = await accountModel.verifyAccount(token);
    if (result > 0) {
        return res.status(200).json({
            status: 'success',
            message: 'Verify successfully.',
        });
    }
    return next(new AppError('Verification code is not found.', 400));
});

exports.protect = catchAsync(async (req, res, next) => {
    const isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
        next();
    } else {
        next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401,
            ),
        );
    }
});

exports.protectPage = catchAsync(async (req, res, next) => {
    const isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
        next();
    } else {
        const nextUrl = req.originalUrl;
        res.redirect(`/login?nextUrl=${nextUrl}`);
    }
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const { user } = req;
    const { userId, username, password } = user;

    // 2) Check if current password is correct
    const { currentPassword, password: rawPassword } = req.body;
    if (!verifyPassword(currentPassword, password)) {
        return next(new AppError('Your current password is wrong!', 401));
    }

    // 3) If so, update the password
    const newPassword = encryptPassword(rawPassword);
    await accountModel.updateAccount({
        userId,
        password: newPassword,
    });

    // 4) Update password in bank server
    await axios.patch(`${bankUrl}/api/account/password`, {
        username,
        password: newPassword,
    });

    // 5) Login again
    req.logIn(user, (logInError) => {
        if (logInError) {
            return next(new AppError(logInError, 500));
        }
        res.status(204).json();
    });
});

exports.logOut = async (req, res) => {
    await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    res.json({ status: 1 });
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action!',
                    403,
                ),
            );
        }
        next();
    };
};

exports.loginSuccess = catchAsync(async (req, res) => {
    const { id, tokenLogin } = req.body;
    try {
        if (!id || !tokenLogin)
            res.status(400).json({
                err: 1,
                msg: 'Missing inputs',
            });
        const response = await authService.loginSuccessService(id, tokenLogin);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            err: -1,
            msg: `Fail at auth controller ${error}`,
        });
    }
});

exports.getLoginPage = catchAsync(async (req, res, next) => {
    const { error, nextUrl: url } = req.query;
    const nextUrl = url || '/mainPage';

    res.render('authentication/login', {
        title: 'Login',
        navbar: () => 'empty',
        footer: () => 'empty',
        nextUrl,
        error,
    });
});

exports.getSignupPage = catchAsync(async (req, res, next) => {
    res.render('authentication/signup', {
        title: 'Sign up',
        navbar: () => 'empty',
        footer: () => 'empty',
    });
});
