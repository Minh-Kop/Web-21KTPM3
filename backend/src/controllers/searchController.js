const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const searchModel = require('../models/searchModel');
const publisherModel = require('../models/publisherModel');
const { priceRanges, sortList, limitList, role } = require('../config/config');

const getBooks = async ({
    keyword,
    priceRange,
    publisherId,
    bookFormat,
    sortType,
    limit,
    page,
}) => {
    if (keyword) {
        keyword = keyword.trim().replace(/\s+/g, '&');
    } else {
        return -1;
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
    limit = +limit || 24;
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
    books.forEach((book) => {
        book.originalPrice = book.originalPrice.toLocaleString('vi-VN');
        book.discountedPrice = book.discountedPrice.toLocaleString('vi-VN');
        book.discountedNumber = book.discountedNumber.toLocaleString('vi-VN');
    });

    return books;
};

const getBooksAPI = catchAsync(async (req, res, next) => {
    const { keyword, priceRange, pubId, bookFormat, sortType, limit, page } =
        req.query;

    const books = await getBooks({
        keyword,
        priceRange,
        publisherId: pubId,
        bookFormat,
        sortType,
        limit,
        page,
    });

    if (books === -1) {
        return next(new AppError("Keyword can't be null.", 400));
    }

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: books.length,
        books,
    });
});

const countBooks = async ({ keyword, priceRange, publisherId, bookFormat }) => {
    if (keyword) {
        keyword = keyword.trim().replace(/\s+/g, '&');
    } else {
        return -1;
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

    const result = await searchModel.countBooks({
        keyword,
        priceRange,
        publisherId,
        bookFormat,
    });

    return result;
};

const countBooksAPI = catchAsync(async (req, res, next) => {
    let { keyword, priceRange, pubId, bookFormat } = req.query;

    if (keyword) {
        keyword = keyword.trim().replace(/\s+/g, '&');
    } else {
        return next(new AppError("Keyword can't be null.", 400));
    }
    if (priceRange) {
        priceRange = priceRange.split(',').map((el) => +el);
    }
    if (pubId) {
        pubId = pubId.split(',').map((el) => el.trim());
    }
    if (bookFormat) {
        bookFormat = bookFormat.split(',').map((el) => el.trim());
    }

    const countedNumber = await countBooks({
        keyword,
        priceRange,
        publisherId: pubId,
        bookFormat,
    });

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        countedNumber,
    });
});

const getSearchPage = catchAsync(async (req, res, next) => {
    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === role.ADMIN;
    }
    const {
        keyword,
        priceRange,
        pubId,
        bookFormat,
        sortType,
        limit: chosenLimit,
        page: chosenPage,
    } = req.query;
    const page = +chosenPage || 1;
    const limit = +chosenLimit || 24;

    const entity = {
        keyword,
        priceRange: priceRange === 'all' ? null : priceRange,
        publisherId: pubId === 'all' ? null : pubId,
        bookFormat,
        sortType,
    };
    const books = await getBooks({
        ...entity,
        limit,
        page,
    });
    const countedNumber = await countBooks({
        ...entity,
    });
    const searchText = `${keyword} (${countedNumber} kết quả)`;
    const totalPages = Math.ceil(parseFloat(countedNumber) / limit);

    // Get URL
    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    const publisher = await publisherModel.getAll();
    publisher.unshift({
        pubId: 'all',
        pubName: 'Tất cả',
    });

    res.render('search/search', {
        title: 'Search page',
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        isAdmin,
        currentUrl: req.originalUrl,
        ...user,
        ...cart,
        categoryTree,
        keyword,
        books,
        priceRanges,
        priceRange: priceRange || 'all',
        publisher,
        chosenPubId: pubId || 'all',
        sortList,
        sortType,
        limitList,
        limit,
        searchText,
        page,
        totalPages,
        link: newUrl,
    });
});

module.exports = {
    getBooks,
    getBooksAPI,
    countBooksAPI,
    getSearchPage,
};
