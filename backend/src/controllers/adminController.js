const { getBookById } = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');
const { getAllBooks } = require('./bookControllerUI');

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
    //const book = await getBookById(req.)
    console.log(req);
    console.log(req.body);
    res.render('bookCRUD/updateBook', {
        layout: 'mainAdmin',
        adminSidebar: () => 'empty',
    });
});

exports.renderUpdateBook = catchAsync(async (req, res, next) => {
    const book = await getBookById(req.query.book);
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

    const categories = [
        {
            id: 'CA02',
            categoryName: 'Comic - Truyện Tranh',
        },
        {
            id: 'CA03',
            categoryName: 'Manga',
        },
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
    ];

    for (const i of fatherCategories) {
        for (const j of i.children) {
            if (j.id === book.CATE_ID) {
                i.selected = true;
                break;
            }
        }
    }

    for (const i of categories) {
        if (i.id === book.CATE_ID) {
            i.selected = true;
            break;
        }
    }
    console.log(book);

    res.render('bookCRUD/updateBook', {
        layout: 'mainAdmin',
        book: book,
        adminSidebar: () => 'empty',
        fCategories: fatherCategories,
        categories: categories,
    });
});
