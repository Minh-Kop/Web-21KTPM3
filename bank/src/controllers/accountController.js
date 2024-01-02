const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');

const createAccount = catchAsync(async (req, res, next) => {
    const { password, username } = req.body;

    // Check for username duplicated
    const account = await accountModel.getByUsername(username);
    if (account) {
        return next(new AppError('Username already exists.', 400));
    }

    // Create entity to insert to DB
    await accountModel.createAccount({
        username,
        password,
    });

    res.status(200).json({
        status: 'success',
        message: 'Create bank account successfully',
    });
});

const getHomePage = catchAsync(async (req, res, next) => {
    
});

module.exports = { createAccount, getHomePage };
