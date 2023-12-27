const express = require('express');

const cartController = require('../controllers/cartControllerUI');

const router = express.Router();

router
    .route('/')
    .get(cartController.getCart)
    .post(cartController.addBookToCart);

router
    .route('/:bookId')
    .patch(cartController.updateBookInCart)
    .delete(cartController.deleteBookFromCart);

module.exports = router;
