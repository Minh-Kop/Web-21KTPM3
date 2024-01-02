const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('../utils/crypto');

const deposit = catchAsync(async (req, res, next) => {
    const { deposit, password } = req.body;
    const { user } = req;
    const { password: encryptedPassword } = user;

    // Check validation of password
    if (!crypto.verifyPassword(password, encryptedPassword)) {
        return next(new AppError('Wrong password', 401));
    }

    console.log('True password');

    res.json({});
});

module.exports = { deposit };
