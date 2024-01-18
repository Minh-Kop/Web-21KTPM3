const {
    getBookById,
    getBookImages,
    deleteBook,
} = require('../models/bookModel');

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
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: req.originalUrl,
        categoryTree,
        isAdmin,
    });
});

exports.renderCategoryPage = catchAsync(async (req, res, next) => {
    const categories = await getAllCategoryWithParent();
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';
    res.render('categoryCRUD/readCategory', {
        layout: 'admin',
        adminSidebar: () => 'adminSidebar',
        headerName: 'Danh sách danh mục',
        title: 'Category management',
        category: true,
        categories: categories,

        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: req.originalUrl,
        categoryTree,
        isAdmin,
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
