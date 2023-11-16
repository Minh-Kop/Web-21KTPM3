const express = require('express');

const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');
const config = require('../config');

const router = express.Router();

router
    .route('/')
    .get(bookController.getAllBooks)
    .post(
        authController.protect,
        authController.restrictTo(config.role.ADMIN),
        bookController.uploadBookImages,
        bookController.createBook,
    );

router.get('/related/:bookId', bookController.getRelatedBooks);
router.get('/newestArrival', bookController.getNewestArrival);
router.get('/bestSeller', bookController.getBestSeller);

router
    .route('/images/:bookId')
    .patch(
        authController.protect,
        authController.restrictTo(config.role.ADMIN),
        bookController.uploadBookImages,
        bookController.updateBookImages,
    )
    .delete(
        authController.protect,
        authController.restrictTo(config.role.ADMIN),
        bookController.deleteBookImage,
    );

router
    .route('/:bookId')
    .get(bookController.getBook)
    .patch(
        authController.protect,
        authController.restrictTo(config.role.ADMIN),
        bookController.updateBook,
    )
    .delete(
        authController.protect,
        authController.restrictTo(config.role.ADMIN),
        bookController.deleteBook,
    );

module.exports = router;
