// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const pointModel = require('../models/pointModel');

exports.getMe = (req, res, next) => {
    req.params.email = req.user.email;
    next();
};

exports.getByEmail = catchAsync(async (req, res, next) => {
    const { email } = req.params;
    const { changedType } = req.query;

    const history = await pointModel.getByEmail({
        email,
        changedType,
    });

    res.status(200).json({
        status: 'success',
        length: history.length,
        history,
    });
});

exports.getAll = catchAsync(async (req, res, next) => {
    const { changedType } = req.query;

    const history = await pointModel.getAll(changedType);

    res.status(200).json({
        status: 'success',
        length: history.length,
        history,
    });
});
