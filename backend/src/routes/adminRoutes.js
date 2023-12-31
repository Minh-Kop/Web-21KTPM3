const express = require('express');
const {
    renderReadBooks,
    renderCreateBook,
    renderUpdateBook,
    renderCategoryPage,
    renderUpdateCategory,
    renderCreateCategory,
} = require('../controllers/adminController');
const {
    deleteBook,
    createBook,
    updateBook,
} = require('../controllers/bookControllerUI');

const router = express.Router();

router.get('/books', renderReadBooks);
router.get('/book/createBookUI', renderCreateBook);
router.get('/book/updateBookUI', renderUpdateBook);
router.get('/book/create', createBook);
router.get('/book/update', updateBook);
router.get('/book/deleteBook', deleteBook);

router.get('/category', renderCategoryPage);
router.get('/category/createCategoryUI', renderCreateCategory);
router.get('/category/updateCategoryUI', renderUpdateCategory);
router.get('/category/create', createBook);
router.get('/category/update', updateBook);
router.get('/category/deleteBook', deleteBook);

module.exports = router;
