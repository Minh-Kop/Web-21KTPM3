const express = require('express');
const {
    renderReadBooks,
    renderCreateBook,
    renderUpdateBook,
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

module.exports = router;
