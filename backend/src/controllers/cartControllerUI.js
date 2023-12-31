const catchAsync = require('../utils/catchAsync');
const bookModel = require('../models/bookModel');
const cartModel = require('../models/cartModel');
const { seperateThousandByDot } = require('../utils/utils');

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
            book.originalPrice = seperateThousandByDot(book.originalPrice);
            book.discountedPrice = seperateThousandByDot(book.discountedPrice);
            book.cartPrice = seperateThousandByDot(book.cartPrice);

            const { image } = await bookModel.getCoverImage(book.bookId);
            book.image = image;

            return book;
        }),
    );

    return {
        cartId,
        cartCount,
        cartTotal: seperateThousandByDot(cartTotal),
        cartBooks,
    };
};

const getCartPage = catchAsync(async (req, res, next) => {
    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
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
    });
});

module.exports = {
    getCart,
    getCartPage,
};
