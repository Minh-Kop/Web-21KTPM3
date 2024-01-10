// const { promisify } = require('util');
const jwt = require('jsonwebtoken');
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
const oauth2Client = require('../utils/oauth2');
const { getVerifyEmail, createTransport } = require('../utils/nodemailer');

const bankUrl = config.BANK_URL;

exports.signUp = catchAsync(async (req, res, next) => {
    const { email, password, username } = req.body;
    const isOauth2 = false;

    // Check for username duplicated
    const account = await accountModel.getByUsername(username);
    if (account) {
        return next(new AppError('Username already exists.', 400));
    }

    // Check for email duplicated
    const emailAccount = await accountModel.getByEmail(email);
    if (emailAccount) {
        return next(new AppError('Email already exists.', 400));
    }

    // 256 bits which provides about 1e+77 possible different number
    // This is enough for preventing brute force
    const verifyToken = generateToken(config.NUMBER_BYTE_VERIFY_TOKEN);

    // Encrypt password by salting and hashing
    const encryptedPassword = encryptPassword(password);

    // Send each mail with different time to prevent the html being trimmed by Gmail
    // const url = `${req.protocol}://${req.get('host')}/api/user`;
    // const mailOption = getVerifyEmail(email, url, verifyToken);
    // const transport = await createTransport();
    // await transport.sendMail(mailOption);

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

exports.signUpForOauth2 = async (email) => {
    // Send each mail with different time to prevent the html being trimmed by Gmail
    // const url = `${req.protocol}://${req.get('host')}/api/user`;
    // const mailOption = getVerifyEmail(email, url, verifyToken);
    // const transport = await createTransport();
    // await transport.sendMail(mailOption);

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

const signToken = (userId) => {
    return jwt.sign({ userId }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user.userId);

    res.cookie('jwt', token, {
        maxAge: config.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        // secure: req.secure || req.headers('x-forwarded-proto') === 'https',
        secure: true,
    });
    // req.session.jwt = token;

    res.status(statusCode).json({
        status: 'success',
        token,
        user,
    });
};

exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    // Check if email and password exist
    if (!username || !password) {
        return next(
            new AppError('Please provide both username and password!', 400),
        );
    }

    // Check for correct username
    const account = await accountModel.getByUsername(username);
    if (!account) {
        return next(new AppError('Username or password is not correct.', 400));
    }

    // Get the database password
    const encryptedPassword = account.ENC_PWD;
    if (!encryptedPassword) {
        return next(new AppError('Username or password is not correct.', 400));
    }

    // Check the correctness of password
    if (!verifyPassword(password, encryptedPassword)) {
        return next(new AppError('Username or password is not correct.', 400));
    }

    // Handle account not verified
    const verified = account.VERIFIED;
    if (!verified) {
        return next(new AppError('Account is not verified.', 400));
    }

    const returnAccount = {
        userId: account.USERID,
        email: account.EMAIL,
        phoneNumber: account.PHONE_NUMBER,
        fullName: account.FULLNAME,
        verified,
    };

    // Send back response with token
    createSendToken(returnAccount, 200, req, res);
});

exports.loginGoogle = catchAsync(async (req, res, next) => {
    // Extract and verify token from Google
    const { tokenId } = req.body;
    const result = await oauth2Client.verifyIdToken({
        idToken: tokenId,
        audience: config.GOOGLE_CLIENT_ID,
    });

    // Create new account if email is not registered
    const { email } = result.payload;
    const currentAccount = await accountModel.getByEmail(email);
    if (!currentAccount) {
        const newAccount = {
            email: email,
            verified: 1,
            role: config.role.USER,
        };
        await accountModel.createAccount(newAccount);
    }

    // Sign a new token by server
    const returnAccount = {
        email,
    };
    createSendToken(returnAccount, 200, req, res);
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

    // 2) Check if POSTed current password is correct
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
        password,
    });

    // 5) Create a new session
    await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    // 6) Login again
    await axios.post(`${req.protocol}://${req.get('host')}/api/user/login`, {
        username,
        password: rawPassword,
    });

    res.status(204).json({});
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
    const fullUrl = req.originalUrl;
    let nextUrl = fullUrl.substring(
        fullUrl.indexOf('nextUrl=') + 'nextUrl='.length,
    );
    nextUrl = nextUrl || '/mainPage';

    res.render('authentication/login', {
        title: 'Login',
        navbar: () => 'empty',
        footer: () => 'empty',
        nextUrl,
    });
});

exports.getSignupPage = catchAsync(async (req, res, next) => {
    res.render('authentication/signup', {
        title: 'Sign up',
        navbar: () => 'empty',
        footer: () => 'empty',
    });
});
