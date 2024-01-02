const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const {
    verifyPassword,
    encryptPassword,
    generateToken,
} = require('../utils/crypto');

exports.protect = catchAsync(async (req, res, next) => {
    const isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
        next();
    } else {
        next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401
            )
        );
    }
});

exports.protectPage = catchAsync(async (req, res, next) => {
    const isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
        next();
    } else {
        res.redirect(`/login`);
    }
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

exports.getLoginPage = catchAsync(async (req, res, next) => {
    res.render('authentication/login', {
        title: 'Login',
        navbar: () => 'empty',
    });
});
