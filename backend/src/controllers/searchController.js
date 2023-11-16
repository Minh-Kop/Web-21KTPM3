const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const searchModel = require('../models/searchModel');

exports.getBooks = catchAsync(async (req, res, next) => {
    let {
        keyword,
        priceRange,
        publisherId,
        bookFormat,
        sortType,
        limit,
        page,
    } = req.query;

    if (keyword) {
        keyword = keyword.trim().replace(/\s+/g, '&');
    } else {
        return next(new AppError("Keyword can't be null.", 400));
    }
    if (priceRange) {
        priceRange = priceRange.split(',').map((el) => +el);
    }
    if (publisherId) {
        publisherId = publisherId.split(',').map((el) => el.trim());
    }
    if (bookFormat) {
        bookFormat = bookFormat.split(',').map((el) => el.trim());
    }
    sortType = sortType || 'BOOK_DISCOUNTED_PRICE';

    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    const books = await searchModel.getBooks({
        keyword,
        priceRange,
        publisherId,
        bookFormat,
        sortType,
        limit,
        offset,
    });

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: books.length,
        books,
    });
});

exports.countBooks = catchAsync(async (req, res, next) => {
    let {
        keyword,
        priceRange,
        publisherId,
        bookFormat,
        sortType,
        limit,
        page,
    } = req.query;

    if (keyword) {
        keyword = keyword.trim().replace(/\s+/g, '&');
    } else {
        return next(new AppError("Keyword can't be null.", 400));
    }
    if (priceRange) {
        priceRange = priceRange.split(',').map((el) => +el);
    }
    if (publisherId) {
        publisherId = publisherId.split(',').map((el) => el.trim());
    }
    if (bookFormat) {
        bookFormat = bookFormat.split(',').map((el) => el.trim());
    }
    if (limit) {
        limit = +limit;
    }
    sortType = sortType || 'BOOK_DISCOUNTED_PRICE';

    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    const result = await searchModel.getBooks({
        keyword,
        priceRange,
        publisherId,
        bookFormat,
        sortType,
        limit,
        offset,
    });

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: result.length,
    });
});
