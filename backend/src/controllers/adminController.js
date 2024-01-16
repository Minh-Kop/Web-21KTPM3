const {
    getBookById,
    getBookImages,
    deleteBook,
    insertImages,
    createBook,
    updateBook,
} = require('../models/bookModel');
const {
    createUploader,
    deleteCloudinaryImage,
} = require('../utils/cloudinary');
const { getAllAuthors } = require('../models/authorModel');
const { getAll } = require('../models/publisherModel');
const {
    getAllCategory,
    getAllParentCategory,
    getChildrenCategory,
    getParent,
    getCategory,
    getAllCategoryWithParent,
} = require('../models/categoryModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { getAllBooks, countBooks } = require('./bookControllerUI');
const config = require('../config/config');
const { buildCategoryRoot } = require('../utils/utils');

exports.renderAdminPage = catchAsync(async (req, res, next) => {
    const books = await getAllBooks({});

    res.render('readBooks', {
        layout: 'mainAdmin',
        books: books,
    });
});

exports.renderReadBooks = catchAsync(async (req, res, next) => {
    const { page: chosenPage, limit: chosenLimit } = req.query;
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    // Parameters to get books
    const page = +chosenPage || 1;
    const limit = +chosenLimit || 24;

    const books = await getAllBooks({
        page,
        limit,
    });

    // Pagination
    const totalNumber = await countBooks({});
    const totalPages = Math.ceil(parseFloat(totalNumber) / limit);
    // Get URL
    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('?page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';
    res.render('bookCRUD/readBooks', {
        layout: 'admin',
        headerName: 'Danh sách sản phẩm',
        title: 'Books management',
        books: books,
        book: true,
        page,
        totalPages,
        link: newUrl,
        categoryTree,
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: url,
        isAdmin,
    });
});

exports.renderCreateBook = catchAsync(async (req, res, next) => {
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const fatherCategories = await getAllParentCategory();
    const allCategories = await getAllCategory();
    const cateTree = buildCategoryRoot(allCategories);
    const cateData = JSON.stringify(cateTree);

    const authorList = await getAllAuthors();
    const publisherList = await getAll();
    const categories = [
        {
            id: 'CA02',
            categoryName: 'Comic - Truyện Tranh',
        },
        {
            id: 'CA03',
            categoryName: 'Manga',
        },
    ];

    res.render('bookCRUD/createBook', {
        title: 'Book creation',
        navbar: () => 'empty',
        footer: () => 'empty',
        fCategories: fatherCategories,
        cateData: cateData,
        categories: categories,
        authors: authorList,
        publishers: publisherList,
        categoryTree,
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: req.originalUrl,
        isAdmin,
    });
});

exports.renderUpdateBook = catchAsync(async (req, res, next) => {
    const { book: bookId } = req.query;
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const book = await getBookById(bookId);
    const bookImg = await getBookImages(bookId);
    const authorList = await getAllAuthors();
    const publisherList = await getAll();

    // Create img tags
    let imgTag = [];
    bookImg.forEach((el) => {
        const { BOOK_PATH: bookPath } = el;
        imgTag.push(
            `<img src="${bookPath}" class="kv-preview-data file-preview-image"></img>`,
        );
    });
    imgTag = imgTag.join('|');

    const fatherCategories = await getAllParentCategory();
    const parent = await getParent(book.CATE_ID);
    const allCategories = await getAllCategory();
    const child = await getChildrenCategory(parent[0].CATE_ID);

    const cateTree = buildCategoryRoot(allCategories);
    const cateData = JSON.stringify(cateTree);

    res.render('bookCRUD/updateBook', {
        title: 'Book detail',
        navbar: () => 'navbar',
        footer: () => 'empty',
        book,
        parentCate: parent[0].CATE_ID,
        fCategories: fatherCategories,
        cCategories: child,
        cateData: cateData,
        authors: authorList,
        publishers: publisherList,
        imgTag,
        categoryTree,
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: req.originalUrl,
        isAdmin,
    });
});

exports.renderCategoryPage = catchAsync(async (req, res, next) => {
    const categories = await getAllCategoryWithParent();
    const { user } = req;
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';
    res.render('categoryCRUD/readCategory', {
        layout: 'admin',
        adminSidebar: () => 'adminSidebar',
        headerName: 'Danh sách danh mục',
        title: 'Category management',
        category: true,
        categories: categories,
        ...user,
    });
});

exports.renderUpdateCategory = catchAsync(async (req, res, next) => {
    const cateId = req.query.category;

    const fatherCategories = await getAllParentCategory();
    const child = await getCategory(cateId);
    const parent = await getParent(cateId);

    res.render('categoryCRUD/updateCategory', {
        layout: 'mainAdmin',
        adminSidebar: () => 'empty',
        parent: parent[0].CATE_ID,
        fCategories: fatherCategories,
        cCategories: child[0],
    });
});

exports.renderCreateCategory = catchAsync(async (req, res, next) => {
    const fatherCategories = await getAllParentCategory();

    res.render('categoryCRUD/createCategory', {
        layout: 'mainAdmin',
        adminSidebar: () => 'empty',
        fCategories: fatherCategories,
    });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
    const { bookId } = req.query;

    const result = await deleteBook(bookId);
    if (!result) {
        return next(new AppError('No book found with that ID!', 404));
    }
    res.redirect('/admin/book');
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

    const coverImage = req.files[0];
    let images = req.files.slice(0);

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
        await deleteCloudinaryImage(coverImage.filename);
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
        await deleteCloudinaryImage(coverImage.filename);
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
        path: coverImage.path,
    });

    // Create entity to insert to database
    const bookId = await createBook({
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
    await insertImages(bookId, images);

    res.redirect('/admin/book');
});

exports.updateBook = catchAsync(async (req, res, next) => {
    let {
        bookId,
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
    console.log(req.body);

    // Update to db
    await updateBook({
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

    res.redirect('/admin/book');
});
