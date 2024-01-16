const express = require('express');

const {
    renderReadBooks,
    renderCreateBook,
    renderUpdateBook,
    renderCategoryPage,
    renderUpdateCategory,
    renderCreateCategory,
    deleteBook,
} = require('../controllers/adminController');
const {
    createCategory,
    deleteCategory,
    updateCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/book', renderReadBooks);
router.get('/book/createBookUI', renderCreateBook);
router.get('/book/updateBookUI', renderUpdateBook);
router.get('/book/delete', deleteBook);

router.get('/order');

router.get('/category', renderCategoryPage);
router.get('/category/createCategoryUI', renderCreateCategory);
router.get('/category/updateCategoryUI', renderUpdateCategory);
router.get('/category/create', createCategory);
router.get('/category/update', updateCategory);
router.get('/category/delete', deleteCategory);

module.exports = router;
