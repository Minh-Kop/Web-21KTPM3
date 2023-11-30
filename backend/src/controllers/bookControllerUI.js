/* eslint-disable prefer-const */
const {
    buildCategoryRoot,
    searchCategoryTree,
    toListCategory,
    getParentBranch,
} = require('../utils/utils');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const categoryModel = require('../models/categoryModel');
const bookModel = require('../models/bookModel');
const {
    createUploader,
    deleteCloudinaryImage,
} = require('../utils/cloudinary');
const config = require('../config/config');

const getListCategoryId = async (categoryId) => {
    if (!categoryId) {
        return null;
    }
    const category = await categoryModel.getAllCategory();
    const categoryTree = buildCategoryRoot(category);
    const selectedNode = searchCategoryTree(categoryTree, categoryId);
    const categoryList = toListCategory(selectedNode);
    return categoryList ? categoryList.map((item) => item.id) : null;
};

const createImageName = async (req, file) => {
    if (file.fieldname === 'coverImage') {
        let { bookId } = req.params;
        if (!bookId) {
            bookId = await bookModel.getNewBookId();
        }
        return `${bookId}-1`;
    }
    if (file.fieldname === 'images') {
        let { bookId } = req.params;
        if (!bookId) {
            bookId = await bookModel.getNewBookId();
        }
        return `${bookId}-${Date.now()}`;
    }
};

const bookImageUploader = createUploader(
    config.CLOUDINARY_PRODUCT_PATH,
    createImageName,
);

exports.uploadBookImages = bookImageUploader.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: config.PRODUCT_IMAGE_NUMBER_LIMIT },
]);

exports.getAllBooks = catchAsync(async (req, res, next) => {
    let {
        categoryId,
        priceRange,
        publisherId,
        bookFormat,
        sortType,
        limit,
        page,
    } = req.query;

    if (priceRange) {
        priceRange = priceRange.split(',').map((el) => +el);
    }
    if (publisherId) {
        publisherId = publisherId.split(',').map((el) => el.trim());
    }
    if (bookFormat) {
        bookFormat = bookFormat.split(',').map((el) => el.trim());
    }

    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    const categoryIdList = await getListCategoryId(categoryId);
    const resultBooks = await bookModel.getAllBooks({
        categoryIdList,
        priceRange,
        publisherId,
        bookFormat,
        sortType: sortType || 'BOOK_DISCOUNTED_PRICE',
        limit,
        offset,
    });

    const books = await Promise.all(
        resultBooks.map(async (item) => {
            const bookId = item.BOOK_ID;
            const { image } = await bookModel.getCoverImage(bookId);
            return {
                bookId,
                bookName: item.BOOK_NAME,
                originalPrice: item.BOOK_PRICE,
                discountedPrice: item.BOOK_DISCOUNTED_PRICE,
                discountedNumber: item.DISCOUNTED_NUMBER,
                avgRating: item.AVG_RATING,
                countRating: item.COUNT_RATING,
                image,
            };
        }),
    );

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: books.length,
        books,
    });
});

exports.getRelatedBooks = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    let { limit, page } = req.query;

    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    let books = await bookModel.getRelatedBooks({
        bookId,
        limit,
        offset,
    });
    books = await Promise.all(
        books.map(async (book) => {
            const { bookId: id } = book;
            const { image } = await bookModel.getCoverImage(id);
            return {
                ...book,
                image,
            };
        }),
    );

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: books.length,
        books,
    });
});

exports.getNewestArrival = catchAsync(async (req, res, next) => {
    let { limit, page } = req.query;

    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    let books = await bookModel.getNewestArrival({
        limit,
        offset,
    });
    books = await Promise.all(
        books.map(async (book) => {
            const { bookId: id } = book;
            const { image } = await bookModel.getCoverImage(id);
            return {
                ...book,
                image,
            };
        }),
    );

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: books.length,
        books,
    });
});

exports.getBestSeller = catchAsync(async (req, res, next) => {
    let { limit, page } = req.query;

    page = +page || 1;
    limit = +limit || 12;
    const offset = (page - 1) * limit;

    let books = await bookModel.getBestSeller({
        limit,
        offset,
    });
    books = await Promise.all(
        books.map(async (book) => {
            const { bookId: id } = book;
            const { image } = await bookModel.getCoverImage(id);
            return {
                ...book,
                image,
            };
        }),
    );

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        length: books.length,
        books,
    });
});

exports.getBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    const returnedBook = await bookModel.getBookById(bookId);

    if (!returnedBook) {
        return next(new AppError('No book found with that ID!', 404));
    }

    const imageList = await bookModel.getBookImages(bookId);
    const images = imageList.map((item) => ({
        id: item.IMAGE_ID,
        path: item.BOOK_PATH,
    }));

    const category = await categoryModel.getAllCategory();
    const categoryTree = buildCategoryRoot(category);
    const selectedBranch = getParentBranch(categoryTree, returnedBook.CATE_ID);

    res.status(200).json({
        status: 'success',
        book: {
            bookId: returnedBook.BOOK_ID,
            bookName: returnedBook.BOOK_NAME,
            category: selectedBranch,
            images: images,
            originalPrice: returnedBook.BOOK_PRICE,
            discountedNumber: returnedBook.DISCOUNTED_NUMBER,
            discountedPrice: returnedBook.BOOK_DISCOUNTED_PRICE,
            avgRating: returnedBook.AVG_RATING,
            countRating: returnedBook.COUNT_RATING,
            stock: returnedBook.STOCK,
            author: returnedBook.author,
            publisher: returnedBook.PUB_NAME,
            publishedYear: returnedBook.PUBLISHED_YEAR,
            weight: returnedBook.BOOK_WEIGHT,
            dimensions: returnedBook.DIMENSIONS.replace(/\?/g, '✖'),
            numberPage: returnedBook.NUMBER_PAGE,
            bookFormat: returnedBook.BOOK_FORMAT,
            description: returnedBook.BOOK_DESC,
        },
    });
});

exports.createBook = catchAsync(async (req, res, next) => {
    let {
        bookName,
        categoryId,
        originalPrice,
        discountedNumber,
        stock,
        authorId,
        publisherId,
        publishedYear,
        weight,
        dimensions,
        numberPage,
        bookFormat,
        description,
    } = req.body;
    let { coverImage, images } = req.files;

    // Miss images
    if (!coverImage && !images) {
        return next(new AppError("Missing book's images!", 400));
    }
    // Miss cover image
    if (!coverImage) {
        await Promise.all(
            images.map(async (el) => {
                await deleteCloudinaryImage(el.filename);
            }),
        );
        return next(new AppError("Missing book's cover image!", 400));
    }
    // Miss sub image
    if (!images) {
        await deleteCloudinaryImage(coverImage[0].filename);
        return next(new AppError("Missing book's sub image!", 400));
    }

    // Miss parameter
    if (
        !bookName ||
        !categoryId ||
        !originalPrice ||
        !discountedNumber ||
        !stock ||
        !authorId ||
        !publisherId ||
        !weight ||
        !dimensions ||
        !numberPage ||
        !bookFormat ||
        !description ||
        !publishedYear
    ) {
        await deleteCloudinaryImage(coverImage[0].filename);
        await Promise.all(
            images.map(async (el) => {
                await deleteCloudinaryImage(el.filename);
            }),
        );
        return next(
            new AppError('Not enough information to create a book!', 400),
        );
    }

    originalPrice = +originalPrice;
    discountedNumber = +discountedNumber;
    stock = +stock;
    weight = +weight;
    numberPage = +numberPage;
    authorId = authorId.split(',').map((el) => el.trim());

    // Number < 0
    if (originalPrice < 0 || discountedNumber < 0 || stock < 0 || weight < 0) {
        await deleteCloudinaryImage(coverImage[0].filename);
        await Promise.all(
            images.map(async (el) => {
                await deleteCloudinaryImage(el.filename);
            }),
        );
        return next(new AppError('Number must be greater than 0.', 400));
    }

    // Limit some image properties
    images = images.map((item) => ({
        path: item.path,
    }));
    images.unshift({
        path: coverImage[0].path,
    });

    // Create entity to insert to database
    const bookId = await bookModel.createBook({
        categoryId,
        bookName,
        originalPrice,
        coverImage,
        stock,
        discountedNumber,
        authorId,
        publisherId,
        publishedYear,
        weight,
        dimensions,
        numberPage,
        bookFormat,
        description,
    });

    // Insert images
    await bookModel.insertImages(bookId, images);

    res.status(200).json({
        status: 'success',
        bookId,
    });
});

exports.updateBookImages = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;

    // Get append images
    let { images: uploadedSubImages } = req.files;

    if (uploadedSubImages) {
        uploadedSubImages = uploadedSubImages.map((item) => ({
            path: item.path,
            filename: item.filename,
        }));

        // Get current sub images
        let subImages = await bookModel.getBookImages(bookId);

        // If number of uploaded images reaches limit then delete the cloudinary images and cancel transaction
        if (
            subImages.length + uploadedSubImages.length >
            config.PRODUCT_IMAGE_NUMBER_LIMIT
        ) {
            await Promise.all(
                uploadedSubImages.map(
                    async (el) => await deleteCloudinaryImage(el.filename),
                ),
            );
            return next(
                new AppError(
                    `Each product can only have ${config.PRODUCT_IMAGE_NUMBER_LIMIT} images.`,
                    400,
                ),
            );
        }
        await bookModel.insertImages(bookId, uploadedSubImages);
    }
    next();
});

exports.updateBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;

    let {
        bookName,
        categoryId,
        originalPrice,
        discountedNumber,
        stock,
        authorId,
        publisherId,
        publishedYear,
        weight,
        dimensions,
        numberPage,
        bookFormat,
        description,
    } = req.body;

    // Update to db
    await bookModel.updateBook({
        bookId,
        categoryId,
        bookName,
        originalPrice,
        stock,
        discountedNumber,
        authorId,
        publisherId,
        publishedYear,
        weight,
        dimensions,
        numberPage,
        bookFormat,
        description,
    });

    res.status(200).json({
        status: 'success',
        bookId,
    });
});

exports.deleteBookImage = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    const { imageFilename, imageId } = req.body;

    await bookModel.deleteBookImage({ bookId, imageId });
    const result = await deleteCloudinaryImage(imageFilename);
    if (!result) {
        return next(
            new AppError(
                `No ${imageFilename} image of book ${bookId} was found.`,
                404,
            ),
        );
    }
    res.status(200).json({
        status: 'success',
        message: `Delete ${imageFilename} image of book ${bookId} successfully.`,
    });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;
    const result = await bookModel.deleteBook(bookId);
    if (!result) {
        return next(new AppError('No book found with that ID!', 404));
    }
    res.status(200).json({
        status: 'success',
        message: `Delete book ${bookId} successfully.`,
    });
});
