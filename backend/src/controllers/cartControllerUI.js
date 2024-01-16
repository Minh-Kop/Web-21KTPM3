const catchAsync = require('../utils/catchAsync');
const bookModel = require('../models/bookModel');
const cartModel = require('../models/cartModel');
const { separateThousandByDot } = require('../utils/utils');
const config = require('../config/config');

const getCart = async (userId) => {
    const cartResult = await cartModel.getCartByUserId(userId);

    const {
        CART_ID: cartId,
        CART_COUNT: cartCount,
        CART_TOTAL: cartTotal,
    } = cartResult;

    let cartBooks = await bookModel.getBooksByCartId(cartId);
    cartBooks = await Promise.all(
        cartBooks.map(async (book) => {
            book.originalPrice = separateThousandByDot(book.originalPrice);
            book.discountedPrice = separateThousandByDot(book.discountedPrice);
            book.cartPriceNumber = book.cartPrice;
            book.cartPrice = separateThousandByDot(book.cartPrice);

            const { image } = await bookModel.getCoverImage(book.bookId);
            book.image = image;

            return book;
        }),
    );

    return {
        cartId,
        cartCount,
        cartTotal: separateThousandByDot(cartTotal),
        cartTotalNumber: cartTotal,
        cartBooks,
    };
};

const getCartPage = catchAsync(async (req, res, next) => {
    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }
    let isAllClicked = false;
    if (cart.cartBooks.length) {
        isAllClicked = cart.cartBooks.every((el) => {
            return el.isClicked === true;
        });
    }

    res.render('cart/cart', {
        title: 'Cart',
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        isAllClicked,
        categoryTree,
        currentUrl: req.originalUrl,
        isAdmin,
    });
});

module.exports = {
    getCart,
    getCartPage,
};
