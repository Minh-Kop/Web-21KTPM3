const express = require('express');

const cart = require('../controllers/cartController');

const router = express.Router();

router.route('/').get(cart.getCart).post(cart.addBookToCart);

router
    .route('/:bookId')
    .patch(cart.updateBookInCart)
    .delete(cart.deleteBookFromCart);

module.exports = router;
