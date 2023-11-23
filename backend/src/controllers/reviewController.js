const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const orderModel = require('../models/orderModel');
const reviewModel = require('../models/reviewModel');
const config = require('../config/config');

exports.createReview = catchAsync(async (req, res, next) => {
    const { bookId, orderId, rating, comment } = req.body;
    const { email } = req.user;

    // Check if order exists
    const orderData = await orderModel.getDetailedOrder(orderId);
    if (!orderData[0] || !orderData[1].length) {
        return next(new AppError('Order not found.', 404));
    }
    const { orderState, createdTime } = orderData[1][0];
    const { email: orderEmail } = orderData[3][0];
    const expirationDate = moment(createdTime)
        .subtract(7, 'h')
        .startOf('day')
        .add(31, 'd');

    // Check for owner
    if (orderEmail !== email) {
        return next(new AppError("Only this order's owner can review.", 403));
    }

    // Check for order state (must be success)
    if (orderState !== config.orderState.SUCCESS) {
        return next(
            new AppError(
                "Order can only be reviewed when it's in success state.",
                400,
            ),
        );
    }

    // Check if the review exceeds the expiration date (30 days after success state)
    if (moment().isSameOrAfter(expirationDate)) {
        return next(new AppError('Exceed the expiration date.', 400));
    }

    // Create review
    const result = await reviewModel.createReview({
        bookId,
        orderId,
        rating,
        comment,
    });

    if (result === 1) {
        await reviewModel.updateBookRating(bookId);
        return res.status(200).json({
            status: 'success',
        });
    }
    if (result === -1) {
        return next(new AppError('This item is not in this order.', 400));
    }
    if (result === -2) {
        return next(
            new AppError("This order's item is already reviewed.", 400),
        );
    }
    if (result === -3) {
        return next(
            new AppError("This order's item is no longer existed.", 400),
        );
    }
    return next(new AppError('Created failed.', 500));
});

exports.getReviews = catchAsync(async (req, res, next) => {
    const { orderId, bookId } = req.query;
    const reviews = await reviewModel.getReviews({
        orderId,
        bookId,
    });
    res.status(200).json({
        status: 'success',
        length: reviews.length,
        reviews,
    });
});
