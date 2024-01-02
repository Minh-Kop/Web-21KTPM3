const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('../utils/crypto');
const transactionModel = require('../models/transactionModel');

const deposit = catchAsync(async (req, res, next) => {
    const { deposit, password } = req.body;
    const { user } = req;
    const { password: encryptedPassword, accountId } = user;

    // Check validation of password
    if (!crypto.verifyPassword(password, encryptedPassword)) {
        return next(new AppError('Wrong password', 401));
    }

    // Create a deposit
    const result = await transactionModel.createDeposit({
        accountId,
        deposit: +deposit,
    });

    res.json({});
});

module.exports = { deposit };
