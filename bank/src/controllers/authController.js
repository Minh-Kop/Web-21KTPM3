const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const protect = catchAsync(async (req, res, next) => {
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

const protectPage = catchAsync(async (req, res, next) => {
    const isLoggedIn = req.isAuthenticated();
    if (isLoggedIn) {
        next();
    } else {
        const nextUrl = req.originalUrl;
        res.redirect(`/login?nextUrl=${nextUrl}`);
    }
});

const logOut = async (req, res) => {
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

const getLoginPage = catchAsync(async (req, res, next) => {
    const fullUrl = req.originalUrl;
    let nextUrl = fullUrl.substring(
        fullUrl.indexOf('nextUrl=') + 'nextUrl='.length
    );
    nextUrl = nextUrl || '/account';

    res.render('authentication/login', {
        title: 'Login',
        navbar: () => 'empty',
        nextUrl,
    });
});

module.exports = {
    protect,
    protectPage,
    logOut,
    getLoginPage,
};
