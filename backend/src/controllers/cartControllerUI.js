const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const bookModel = require('../models/bookModel');
const cartModel = require('../models/cartModel');
const { seperateThousandByDot } = require('../utils/utils');

exports.getCart = async (userId) => {
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

exports.addBookToCart = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { bookId, quantity, isClicked } = req.body;

    const cartResult = await cartModel.getCartByUserId(userId);
    const { CART_ID: cartId } = cartResult;

    const book = await bookModel.getBookById(bookId);
    if (!book) {
        return next(new AppError('Book not found.', 404));
    }

    const books = await bookModel.getBooksByCartId(cartId);

    if (books) {
        const matchBook = books.find((item) => item.bookId === bookId);
        if (matchBook) {
            const returnValue = await cartModel.updateBookInCart({
                cartId,
                bookId,
                quantity: +quantity + matchBook.quantity,
                isClicked,
            });
            if (returnValue !== 1) {
                await cartModel.deleteFromCart(cartId, bookId);
                await cartModel.updateCartQuantityCartTotal(cartId);
                return next(
                    new AppError(`This book is no longer existed.`, 404),
                );
            }
            await cartModel.updateCartQuantityCartTotal(cartId);
            return res.status(200).json({
                status: 'success',
                message: 'Update successfully.',
            });
        }
    }

    const returnValue = await cartModel.addBookToCart({
        cartId,
        bookId,
        quantity,
        isClicked: isClicked || 0,
    });
    if (returnValue !== 1) {
        return next(new AppError(`This book is no longer existed.`, 404));
    }

    await cartModel.updateCartQuantityCartTotal(cartId);
    res.status(200).json({
        status: 'success',
    });
});

exports.getCartPage = catchAsync(async (req, res, next) => {
    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    // console.log(cart);

    res.render('cart/cart', {
        title: 'Cart',
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        categoryTree,
        currentUrl: req.originalUrl,
    });
});

exports.updateBookInCart = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { bookId } = req.params;
    const { quantity, isClicked } = req.body;

    const cartResult = await cartModel.getCartByUserId(userId);
    const { CART_ID: cartId } = cartResult;

    const result = await cartModel.updateBookInCart({
        cartId,
        bookId,
        quantity,
        isClicked,
    });

    if (result === 1) {
        await cartModel.updateCartQuantityCartTotal(cartId);
        return res.status(200).json({
            status: 'success',
        });
    }
    await cartModel.deleteFromCart(cartId, bookId);
    await cartModel.updateCartQuantityCartTotal(cartId);
    return next(new AppError(`This book is no longer existed.`, 404));
});

exports.deleteBookFromCart = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { bookId } = req.params;

    const cartResult = await cartModel.getCartByUserId(userId);
    const { CART_ID: cartId } = cartResult;

    const result = await cartModel.deleteFromCart(cartId, bookId);
    await cartModel.updateCartQuantityCartTotal(cartId);

    if (result) {
        res.status(200).json({
            status: 'success',
        });
    } else {
        return next(new AppError('Book not found.', 404));
    }
});
