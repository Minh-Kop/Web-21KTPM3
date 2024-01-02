const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const { verifyPassword, encryptPassword } = require('../utils/crypto');

exports.createAccount = catchAsync(async (req, res, next) => {
    const { password, username } = req.body;

    // Check for username duplicated
    const account = await accountModel.getByUsername(username);
    if (account) {
        return next(new AppError('Username already exists.', 400));
    }

    // Encrypt password by salting and hashing
    const encryptedPassword = encryptPassword(password);

    // Create entity to insert to DB
    await accountModel.createAccount({
        username,
        password: encryptedPassword,
    });

    res.status(200).json({
        status: 'success',
        message: 'Create account successfully',
    });
});
