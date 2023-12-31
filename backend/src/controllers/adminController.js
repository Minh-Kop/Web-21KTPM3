const { getBookById, getBookImages } = require('../models/bookModel');
const { getAllCategory } = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const { getAllBooks } = require('./bookControllerUI');

const fatherCategories = [
    {
        id: 'CA01',
        categoryName: 'Manga - Comic',
        children: [
            {
                id: 'CA02',
                categoryName: 'Comic - Truyện Tranh',
            },
            {
                id: 'CA03',
                categoryName: 'Manga',
            },
        ],
    },
    {
        id: 'CA04',
        categoryName: 'Tâm Lý - Kỹ Năng Sống',
        children: [
            {
                id: 'CA05',
                categoryName: 'Kỹ Năng Sống',
            },
            {
                id: 'CA06',
                categoryName: 'Sách Cho Tuổi Mới Lớn',
            },
            {
                id: 'CA07',
                categoryName: 'Tâm Lý',
            },
        ],
    },
    {
        id: 'CA08',
        categoryName: 'Thiếu nhi',
        children: [
            {
                id: 'CA09',
                categoryName: 'Kiến Thức - Kỹ Năng Sống Cho Trẻ',
            },
            {
                id: 'CA10',
                categoryName: 'Kiến Thức Bách Khoa',
            },
            {
                id: 'CA11',
                categoryName: 'Truyện Thiếu Nhi',
            },
        ],
    },
    {
        id: 'CA12',
        categoryName: 'Văn Học',
        children: [
            {
                id: 'CA13',
                categoryName: 'Light Novel',
            },
            {
                id: 'CA14',
                categoryName: 'Tiểu Thuyết',
            },
            {
                id: 'CA15',
                categoryName: 'Truyện Ngắn - Tản Văn',
            },
        ],
    },
];

exports.renderAdminPage = catchAsync(async (req, res, next) => {
    const books = getAllBooks;

    res.render('readBooks', {
        layout: 'mainAdmin',
        books: books,
    });
});

exports.renderReadBooks = catchAsync(async (req, res, next) => {
    const books = await getAllBooks({});
    res.render('bookCRUD/readBooks', {
        layout: 'mainAdmin',
        adminSidebar: () => 'adminSidebar',
        books: books,
        headerName: 'Danh sách sản phẩm',
        book: true,
        title: 'Books management',
        // navbar: () => 'empty',
        // footer: () => 'empty',
    });
});

exports.renderCreateBook = catchAsync(async (req, res, next) => {
    const cateData = JSON.stringify(fatherCategories);
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
        layout: 'mainAdmin',
        adminSidebar: () => 'empty',
        fCategories: fatherCategories,
        cateData: cateData,
        categories: categories,
    });
});

exports.renderUpdateBook = catchAsync(async (req, res, next) => {
    const book = await getBookById(req.query.book);
    const bookImg = await getBookImages(req.query.book);
    let cCate = [];

    for (const i of fatherCategories) {
        for (const j of i.children) {
            if (j.id === book.CATE_ID) {
                i.selected = true;
                j.selected = true;
                cCate = i.children;
                break;
            }
        }
    }
    //console.log(book);
    const cateData = JSON.stringify(fatherCategories);

    res.render('bookCRUD/updateBook', {
        layout: 'mainAdmin',
        book: book,
        adminSidebar: () => 'empty',
        fCategories: fatherCategories,
        cateData: cateData,
        cCategories: cCate,
        images: bookImg,
    });
});

exports.renderCategoryPage = catchAsync(async (req, res, next) => {
    const categories = await getAllCategory();

    res.render('categoryCRUD/readCategory', {
        layout: 'mainAdmin',
        adminSidebar: () => 'adminSidebar',
        headerName: 'Danh sách danh mục',
        title: 'Category management',
        category: true,
        categories: categories,
    });
});

exports.renderUpdateCategory = catchAsync(async (req, res, next) => {
    const cateId = req.query.category;
    let cCate = [];
    const fCate = await getAllCategory();

    for (const i of fCate) {
        if (i.CATE_ID === cateId) {
            cCate = i;
            if (i.PARENT_ID) {
                for (const j of fCate) {
                    if (j.CATE_ID == i.PARENT_ID) {
                        j.selected = true;
                    }
                }
            }
        }
    }

    const cateData = JSON.stringify(fatherCategories);

    res.render('categoryCRUD/updateCategory', {
        layout: 'mainAdmin',
        adminSidebar: () => 'empty',
        fCategories: fCate,
        cCategories: cCate,
        cateData: cateData,
    });
});

exports.renderCreateCategory = catchAsync(async (req, res, next) => {
    const fCate = await getAllCategory();
    res.render('categoryCRUD/createCategory', {
        layout: 'mainAdmin',
        adminSidebar: () => 'empty',
        fCategories: fCate,
    });
});
