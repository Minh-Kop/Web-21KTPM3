const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/img/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });
const {
    renderReadBooks,
    renderCreateBook,
    renderUpdateBook,
    renderCategoryPage,
    renderUpdateCategory,
    renderCreateCategory,
    deleteBook,
    createBook,
    createBookTest,
} = require('../controllers/adminController');
const { updateBook } = require('../controllers/bookControllerUI');
const {
    createCategory,
    deleteCategory,
    updateCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/books', renderReadBooks);
router.get('/book/createBookUI', renderCreateBook);
router.get('/book/updateBookUI', renderUpdateBook);
router.post('/book/create', upload.array('files', 3), createBook);
router.get('/book/update', updateBook);
router.get('/book/delete', deleteBook);

router.get('/category', renderCategoryPage);
router.get('/category/createCategoryUI', renderCreateCategory);
router.get('/category/updateCategoryUI', renderUpdateCategory);
router.get('/category/create', createCategory);
router.get('/category/update', updateCategory);
router.get('/category/delete', deleteCategory);

module.exports = router;
