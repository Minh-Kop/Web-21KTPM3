const express = require('express');

const cartController = require('../controllers/cartController');

const router = express.Router();

router
    .route('/')
    .get(cartController.getCart)
    .post(cartController.addBookToCart);

router.patch('/all', cartController.updateAllBooksInCart);

router
    .route('/:bookId')
    .patch(cartController.updateBookInCart)
    .delete(cartController.deleteBookFromCart);

module.exports = router;
