const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const paymentModel = require('../models/paymentModel');
const accountModel = require('../models/accountModel');
const {
    MomoCheckoutProvider,
    PaypalCheckoutProvider,
    ShipCodCheckoutProvider,
} = require('../utils/checkout');
const { getRate } = require('../utils/currencyConverter');
const crypto = require('../utils/crypto');

exports.checkout = catchAsync(async (req, res, next) => {
    const { addrId, shippingFee } = req.body;
    const { user, cart } = req;
    const { userId } = user;
    const { cartId, cartTotalNumber: merchandiseSubtotal, cartBooks } = cart;

    // Prepare order items
    // If cart is empty, raise error
    if (merchandiseSubtotal === 0) {
        return next(new AppError("Can't check out with empty cart.", 400));
    }

    const books = cartBooks.filter((el) => el.isClicked);

    // Create an order
    const result = await orderModel.createOrder({
        userId,
        addrId,
        merchandiseSubtotal,
        shippingFee: +shippingFee,
    });

    if (result.returnValue !== 1) {
        return next(new AppError('Create order failed.', 500));
    }

    const { orderId } = result.recordset[0];

    // Transfer clicked books in cart to order
    const isCreatedList = await Promise.all(
        books.map(async (book) => {
            const { bookId, quantity, cartPriceNumber: price } = book;
            const createdResult = await orderModel.createDetailedOrder({
                orderId,
                bookId,
                quantity,
                price,
            });
            return {
                bookId,
                createdResult,
            };
        }),
    );

    // If there are any errors in book creation, delete that book from the cart
    const isFailedList = await Promise.all(
        isCreatedList.map(async ({ bookId, createdResult }) => {
            if (createdResult !== 1) {
                await cartModel.deleteFromCart(cartId, bookId);
            }
            return createdResult;
        }),
    );
    await cartModel.updateCartQuantityCartTotal(cartId);

    // If there is any failed order detail creation, delete this order
    if (isFailedList.some((el) => el !== 1)) {
        await orderModel.deleteOrder(orderId);
        return next(
            new AppError(`There is at least 1 no longer existed book.`, 404),
        );
    }

    // Delete clicked books in cart
    await cartModel.deleteClickedBooksFromCart(userId, orderId);

    res.json({ orderId });
});

exports.placeOrder = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { orderId } = req.params;

    // Verify order ID
    const { totalPayment } = await orderModel.getTotalPayment(orderId);
    if (!totalPayment) {
        return next(new AppError('Order not found.', 4));
    }

    // Get user information
    const { FULLNAME: fullName, PHONE_NUMBER: phoneNumber } =
        await accountModel.getByUserId(userId);
    if (!fullName) {
        return next(new AppError('User not found.', 404));
    }
    const userInfo = {
        userId,
        fullName,
        phoneNumber,
        orderId,
    };

    // Verify payment ID
    const { paymentProvider } = await paymentModel.getPaymentById(paymentId);
    if (!paymentProvider) {
        return next(new AppError('Payment not found.', 404));
    }

    // Create checkout provider
    let checkoutProvider;
    if (paymentProvider === config.payment.MOMO) {
        checkoutProvider = new MomoCheckoutProvider();
    } else if (paymentProvider === config.payment.PAYPAL) {
        checkoutProvider = new PaypalCheckoutProvider();
    } else if (paymentProvider === config.payment.COD) {
        checkoutProvider = new ShipCodCheckoutProvider();
    }

    // Calculate exchanged price
    const exchangedPrice =
        Math.round(
            100 *
                totalPayment *
                getRate(checkoutProvider.getCurrency(), config.currency.VND),
        ) / 100;

    // Create orderId and link
    const [paymentOrderId, redirectUrl] = await checkoutProvider.createLink(
        exchangedPrice,
        userInfo,
        // `${req.headers.origin}`,
        `${req.protocol}://${req.get('host')}`,
        `${req.protocol}://${req.get('host')}`,
    );

    // Change order state to pending without paying
    if (paymentProvider === config.payment.COD) {
        await orderModel.updateState(orderId, config.orderState.PENDING);
        await cartModel.deleteClickedBooksFromCart(email, orderId);
    }

    res.status(200).json({
        status: 'success',
        paymentOrderId,
        redirectUrl,
    });
});

exports.notifyPaypal = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const { orderId, paymentOrderId } = req.body;
    const provider = new PaypalCheckoutProvider();

    const detailResponse = await provider.getDetail(paymentOrderId);
    const { status } = detailResponse;
    if (status !== 'APPROVED') {
        return next(new AppError('Payment is not approved.', 400));
    }

    const captureResponse = await provider.capturePayment(paymentOrderId);
    if (captureResponse.status === 'COMPLETED') {
        await orderModel.updateState(orderId, config.orderState.PENDING);
        await cartModel.deleteClickedBooksFromCart(email, orderId);
        res.status(200).json({
            status: 'success',
        });
    } else {
        return next(new AppError('Payment is failed.', 400));
    }
});

exports.notifyMomo = catchAsync(async (req, res, next) => {
    const { resultCode, amount, extraData, orderId: longOrderId } = req.body;
    const { email } = JSON.parse(crypto.decryptBase64(extraData));
    const orderId = longOrderId.split('_')[0];

    // Verify signature
    const provider = new MomoCheckoutProvider();
    if (!provider.verifyIpnSignature(req.body)) {
        return next(new AppError('Signature is mismatch.', 400));
    }

    // Verify for total payment
    const { totalPayment } = await orderModel.getTotalPayment(orderId);
    if (totalPayment !== amount) {
        return next(new AppError('Amount is mismatch.', 400));
    }

    // Check for transaction success
    if (resultCode !== 0) {
        return next(new AppError('Payment is failed.', 400));
    }

    await orderModel.updateState(orderId, config.orderState.PENDING);
    await cartModel.deleteClickedBooksFromCart(email, orderId);

    // Response for acknowledge
    res.status(200).json({
        status: 'success',
    });
});
