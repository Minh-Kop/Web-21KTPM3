const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const bookModel = require('../models/bookModel');
const cartModel = require('../models/cartModel');
const shippingAddressModel = require('../models/shippingAddressModel');
const { getDistance } = require('../utils/map');
const orderModel = require('../models/orderModel');
const voucherModel = require('../models/voucherModel');
const paymentModel = require('../models/paymentModel');
const accountModel = require('../models/accountModel');
const {
    MomoCheckoutProvider,
    PaypalCheckoutProvider,
    ShipCodCheckoutProvider,
} = require('../utils/checkout');
const { getRate } = require('../utils/currencyConverter');
const crypto = require('../utils/crypto');

exports.getOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const [deliveryInformation, booksOrdered, orderInformation] =
        await orderModel.getInitialOrder(orderId);
    res.status(200).json({
        status: 'success',
        data: {
            deliveryInformation: deliveryInformation[0],
            booksOrdered,
            orderInformation: orderInformation[0],
        },
    });
});

exports.getPrice = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const order = await orderModel.getPrice(orderId);
    res.status(200).json({
        status: 'success',
        order,
    });
});

exports.createInitialOrder = catchAsync(async (req, res, next) => {
    const { email } = req.user;

    // Delete older initial orders
    await orderModel.deleteAllInitialOrders(email);

    // Prepare order items
    let books;

    const { CART_ID: cartId, CART_TOTAL: merchandiseSubtotal } =
        await cartModel.getCartByEmail(email);

    // If cart is empty, raise error
    if (merchandiseSubtotal === 0) {
        return next(new AppError("Can't check out with empty cart.", 400));
    }

    books = await bookModel.getBooksByCartId(cartId);

    books = books.filter((el) => el.isClicked);

    // Get shipping address
    let shippingAddress =
        await shippingAddressModel.getShippingAddressesByEmail(email);
    shippingAddress = shippingAddress.filter((el) => el.isDefault)[0];

    // Is there no shipping address?
    if (!shippingAddress) {
        return next(
            new AppError('Missing shipping address! Please create one.', 400),
        );
    }

    // Calculate shipping fee
    const distance = await getDistance(
        config.SHOP_LAT,
        config.SHOP_LONG,
        shippingAddress.lat,
        shippingAddress.lng,
    );
    let shippingFee;
    if (distance) {
        if (distance < 5000) {
            shippingFee = 20000;
        } else {
            shippingFee = 30000;
        }
    } else {
        shippingFee = 0;
    }

    // Create an order
    const result = await orderModel.createInitialOrder({
        email,
        addrId: shippingAddress.addrId,
        merchandiseSubtotal,
        shippingFee,
    });

    if (result.returnValue !== 1) {
        return next(new AppError('Create order failed.', 500));
    }

    const { orderId } = result.recordset[0];

    // Transfer clicked books in cart to order
    const isCreatedList = await Promise.all(
        books.map(async (book) => {
            const createdResult = await orderModel.createDetailedOrder({
                orderId,
                bookId: book.bookId,
                quantity: book.quantity,
                price: book.cartPrice,
            });
            return {
                bookId: book.bookId,
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

    // If there is any failed book creation, delete this order
    if (isFailedList.includes(0) || isFailedList.includes(-1)) {
        await orderModel.deleteAllInitialOrders(email);
        return next(
            new AppError(`There is at least 1 no longer existed book.`, 404),
        );
    }

    req.params = {
        orderId,
    };
    next();
});

exports.addVoucher = catchAsync(async (req, res, next) => {
    const { voucherId, orderId } = req.body;

    if (!voucherId || !orderId) {
        return next(new AppError('Missing parameter.', 400));
    }

    const listVoucherId = voucherId.split(',').map((el) => el.trim());

    const result = await Promise.all(
        listVoucherId.map(async (el) => {
            return await voucherModel.useVoucher(orderId, el);
        }),
    );

    if (result.includes(-1)) {
        return next(
            new AppError(`Subtotal isn't enough to use this voucher.`, 400),
        );
    }
    if (result.includes(-2)) {
        return next(new AppError(`Out of vouchers.`, 400));
    }
    if (result.includes(-3)) {
        return next(
            new AppError(`Subtotal isn't enough to use this voucher.`, 400),
        );
    }
    if (result.includes(-4)) {
        return next(new AppError(`Out of vouchers.`, 400));
    }
    if (result.includes(-5)) {
        return next(new AppError(`User doesn't have this voucher.`, 400));
    }

    req.params = {
        orderId,
    };
    next();
});

exports.updateCheckout = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { addrId, paymentId, useHPoint, hPoint } = req.body;
    let shippingFee = 0;

    // Handle shipping address
    if (addrId) {
        // Get shipping address
        const shippingAddress =
            await shippingAddressModel.getShippingAddressesById(addrId);

        // Is there no shipping address?
        if (!shippingAddress) {
            return next(new AppError("Can't find that shipping address.", 404));
        }

        // Calculate shipping fee
        const distance = await getDistance(
            config.SHOP_LAT,
            config.SHOP_LONG,
            shippingAddress.lat,
            shippingAddress.lng,
        );
        if (distance) {
            if (distance < 5000) {
                shippingFee = 20000;
            } else {
                shippingFee = 30000;
            }
        } else {
            shippingFee = 0;
        }
    }

    // Handle payment
    if (paymentId) {
        const { paymentProvider } = await paymentModel.getPaymentById(
            paymentId,
        );
        if (!paymentProvider) {
            return next(new AppError('Payment not found.', 404));
        }
    }

    const result = await orderModel.updateOrder({
        orderId,
        addrId,
        shippingFee,
        paymentId,
        useHPoint: +useHPoint,
        hPoint: +hPoint,
    });
    if (result !== 1) {
        return next(new AppError('Update failed', 500));
    }

    next();
});

exports.deleteInitialOrders = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const result = await orderModel.deleteAllInitialOrders(email);
    if (result <= 0) {
        return next(new AppError('Order not found.', 404));
    }
    res.status(200).json({
        status: 'success',
    });
});

exports.placeOrder = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const { orderId } = req.params;
    const { paymentId } = req.body;

    // Verify order ID
    const { totalPayment } = await orderModel.getTotalPayment(orderId);
    if (!totalPayment) {
        return next(new AppError('Order not found.', 4));
    }

    // Get user information
    const { FULLNAME: fullName, PHONE_NUMBER: phoneNumber } =
        await accountModel.getByEmail(email);
    if (!fullName) {
        return next(new AppError('Email not found.', 404));
    }
    const userInfo = {
        email,
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
