const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const orderModel = require('../models/orderModel');
const bookModel = require('../models/bookModel');
const accountModel = require('../models/accountModel');
const cartModel = require('../models/cartModel');

exports.getOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const [
        deliveryInformation,
        tempOrderStates,
        booksOrdered,
        orderInformation,
    ] = await orderModel.getDetailedOrder(orderId);

    if (!deliveryInformation || !tempOrderStates.length) {
        return next(new AppError('Order not found.', 404));
    }

    const orderStates = tempOrderStates.map((el) => ({
        ...el,
        createdTime: moment(el.createdTime)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm'),
    }));

    res.render('account/order_detail', {
        status: 'success',
        data: {
            deliveryInformation: deliveryInformation[0],
            orderStates,
            booksOrdered,
            orderInformation: orderInformation[0],
        },
    });
});

exports.getThisOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const [
        deliveryInformation,
        tempOrderStates,
        booksOrdered,
        orderInformation,
    ] = await orderModel.getDetailedOrder(orderId);

    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    if (!deliveryInformation || !tempOrderStates.length) {
        return next(new AppError('Order not found.', 404));
    }

    const orderStates = tempOrderStates.map((el) => ({
        ...el,
        createdTime: moment(el.createdTime)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm'),
    }));
    let totalQuantity = 0;
    for (let i = 0; i < booksOrdered.length; i++) {
        totalQuantity += booksOrdered[i].amount;
    }
    orderInformation.forEach((order) => {
        order.orderDate = moment(order.orderDate)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY');
        order.totalPayment = order.totalPayment || 0;
        order.totalPaymentString = order.totalPayment.toLocaleString('vi-VN');
        order.totalQuantity = totalQuantity;
        order.shippingFee = order.shippingFee || 0;
        order.shippingFeeString = order.shippingFee.toLocaleString('vi-VN');
        order.merchandiseSubtotal = order.merchandiseSubtotal || 0;
        order.merchandiseSubtotalString =
            order.merchandiseSubtotal.toLocaleString('vi-VN');
    });
    booksOrdered.forEach((book) => {
        book.unitPrice = book.unitPrice || 0;
        book.unitPriceString = book.unitPrice.toLocaleString('vi-VN');
        book.itemSubtotal = book.itemSubtotal || 0;
        book.itemSubtotalString = book.itemSubtotal.toLocaleString('vi-VN');
    });
    res.render('account/order_detail', {
        title: 'Chi tiết đơn hàng',
        status: 'success',
        data: {
            deliveryInformation: deliveryInformation[0],
            orderStates,
            booksOrdered,
            orderInformation: orderInformation[0],
        },
        link: newUrl,
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        categoryTree,
        currentUrl: url,
        isAdmin,
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
    req.query.email = req.user.email;
    next();
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
    const { email, orderState, limit: strLimit, page: strPage } = req.query;

    const page = +strPage || 1;
    const limit = +strLimit || 10;
    const offset = (page - 1) * limit;

    const returnedOrders = await orderModel.getUserOrders({
        email,
        orderState,
        limit,
        offset,
    });
    const orders = await Promise.all(
        returnedOrders.map(async (order) => {
            const books = await bookModel.getBooksByOrderId(order.orderId);
            return {
                orderId: order.orderId,
                orderState: order.orderState,
                booksLength: books.length,
                books,
                ...order,
            };
        }),
    );
    res.status(200).json({
        status: 'success',
        ordersLength: orders.length,
        orders,
    });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const { userId, orderState, limit: strLimit, page: strPage } = req.query;

    if (!orderState) {
        return res.redirect('/order/me?orderState=6');
    }

    const page = +strPage || 1;
    const limit = +strLimit || 10;
    const offset = (page - 1) * limit;

    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }
    const uid = user.userId;
    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    const returnedOrders = await orderModel.getUserOrders({
        uid,
        orderState,
        limit,
        offset,
    });

    const tempOrderNumber = await orderModel.countOrders(uid);
    const total = tempOrderNumber.reduce(
        (accumulator, currentValue) => accumulator + currentValue.totalNumber,
        0,
    );
    let orderNumber = [
        {
            orderstate: 6,
            totalNumber: total,
        },
        {
            orderstate: 0,
            totalNumber: 0,
        },
        {
            orderstate: 1,
            totalNumber: 0,
        },
        {
            orderstate: 2,
            totalNumber: 0,
        },
        {
            orderstate: 3,
            totalNumber: 0,
        },
        {
            orderstate: -1,
            totalNumber: 0,
        },
    ];
    const orderStatesDict = new Map(
        orderNumber.map((item) => [item.orderstate, item]),
    );

    tempOrderNumber.forEach((order) => {
        if (orderStatesDict.has(order.orderstate)) {
            orderStatesDict.get(order.orderstate).totalNumber =
                order.totalNumber;
        }
    });

    orderNumber = Array.from(orderStatesDict.values());

    const totalPages = Math.ceil(
        parseFloat(
            orderNumber.find((order) => order.orderstate == orderState)
                .totalNumber,
        ) / limit,
    );
    returnedOrders.forEach((order) => {
        order.orderDate = order.orderDate.toISOString().split('T')[0];
        order.totalPaymentString = order.totalPayment.toLocaleString('vi-VN');
    });
    const orders = await Promise.all(
        returnedOrders.map(async (order) => {
            const books = await bookModel.getBooksByOrderId(order.orderId);
            return {
                orderId: order.orderId,
                orderState: order.orderState,
                booksLength: books.length,
                books,
                ...order,
            };
        }),
    );
    res.render('account/order_list', {
        title: 'Đơn hàng của tôi',
        status: 'success',
        ordersLength: orders.length,
        orders,
        link: newUrl,
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        page,
        limit,
        totalPages,
        orderNumber,
        orderState: +orderState,
        currentUrl: url,
        categoryTree,
        isAdmin,
    });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
    const { orderState, limit: strLimit, page: strPage } = req.query;

    const page = +strPage || 1;
    const limit = +strLimit || 10;
    const offset = (page - 1) * limit;

    const returnedOrders = await orderModel.getAllOrders({
        orderState,
        limit,
        offset,
    });
    const orders = await Promise.all(
        returnedOrders.map(async (order) => {
            const books = await bookModel.getBooksByOrderId(order.orderId);
            return {
                orderId: order.orderId,
                orderState: order.orderState,
                booksLength: books.length,
                books,
                ...order,
            };
        }),
    );

    res.status(200).json({
        status: 'success',
        ordersLength: orders.length,
        orders,
    });
});

exports.updateState = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const orderState = +req.body.orderState;
    const { orderId } = req.params;

    const { HROLE: role } = await accountModel.getByEmail(email);

    const orderData = await orderModel.getDetailedOrder(orderId);
    if (!orderData[0] || !orderData[1].length) {
        return next(new AppError('Order not found.', 404));
    }
    const { orderState: previousState } = orderData[1][0];
    const { email: orderEmail } = orderData[3][0];

    switch (orderState) {
        // Pending to shipping (admin only)
        case config.orderState.SHIPPING: {
            if (role !== config.role.ADMIN) {
                return next(
                    new AppError(
                        'You do not have permission to perform this action!',
                        403,
                    ),
                );
            }
            if (previousState !== config.orderState.PENDING) {
                return next(
                    new AppError(
                        'Order can only change to shipping during pending state.',
                        400,
                    ),
                );
            }
            await orderModel.updateState(orderId, config.orderState.SHIPPING);
            break;
        }
        // Pending to cancel (owner only)
        case config.orderState.CANCEL: {
            if (orderEmail !== email && role !== config.role.ADMIN) {
                return next(
                    new AppError(
                        'You do not have permission to perform this action!',
                        403,
                    ),
                );
            }
            if (previousState !== config.orderState.PENDING) {
                return next(
                    new AppError(
                        'Order can only be cancelled during pending state.',
                        400,
                    ),
                );
            }
            await orderModel.updateState(orderId, config.orderState.CANCEL);
            break;
        }
        // Shipping to success (owner only)
        case config.orderState.SUCCESS: {
            if (orderEmail !== email) {
                return next(
                    new AppError(
                        'You do not have permission to perform this action!',
                        403,
                    ),
                );
            }
            if (previousState !== config.orderState.SHIPPING) {
                return next(
                    new AppError(
                        'Order can only change to success during shipping state.',
                        400,
                    ),
                );
            }
            await orderModel.updateState(orderId, config.orderState.SUCCESS);
            break;
        }
        // Shipping to refunding (owner only)
        case config.orderState.REFUNDING: {
            if (orderEmail !== email) {
                return next(
                    new AppError(
                        'Only order owner can do this operation!',
                        403,
                    ),
                );
            }
            if (previousState !== config.orderState.SHIPPING) {
                return next(
                    new AppError(
                        'Order can only be refunded during shipping state.',
                        400,
                    ),
                );
            }
            await orderModel.updateState(orderId, config.orderState.REFUNDING);
            break;
        }
        // Refunding to refunded (admin only)
        case config.orderState.REFUNDED: {
            if (role !== config.role.ADMIN) {
                return next(
                    new AppError('Only admin can do this operation!', 403),
                );
            }
            if (previousState !== config.orderState.REFUNDING) {
                return next(
                    new AppError(
                        'Order can only be refunded during refunding state.',
                        400,
                    ),
                );
            }
            await orderModel.updateState(orderId, config.orderState.REFUNDED);
            break;
        }
        default: {
            return next(new AppError('Invalid order state.', 400));
        }
    }

    res.status(200).json({
        status: 'success',
    });
});

exports.buyAgain = catchAsync(async (req, res, next) => {
    const { email } = req.user;
    const { orderId } = req.body;

    const books = await orderModel.getOrderDetail(orderId);
    if (!books.length) {
        return next(new AppError('Order not found.', 404));
    }

    const cartResult = await cartModel.getCartByEmail(email);
    const { CART_ID: cartId } = cartResult;
    const cartBooks = await bookModel.getBooksByCartId(cartId);

    const isCreatedList = await Promise.all(
        books.map(async ({ bookId, quantity }) => {
            const isClicked = 1;
            const cartBook = cartBooks.find((item) => item.bookId === bookId);

            if (cartBook) {
                const returnedValue = await cartModel.updateBookInCart({
                    cartId,
                    bookId,
                    quantity: +quantity + cartBook.quantity,
                    isClicked,
                });
                return returnedValue;
            }

            const returnedValue = await cartModel.addBookToCart({
                cartId,
                bookId,
                quantity,
                isClicked,
            });
            return returnedValue;
        }),
    );

    let success = true;

    // If there are any errors in adding or updating, delete all added book from the cart
    if (isCreatedList.includes(0) || isCreatedList.includes(-1)) {
        success = false;
        await Promise.all(
            books.map(async ({ bookId }) => {
                return await cartModel.deleteFromCart(cartId, bookId);
            }),
        );
    }

    await cartModel.updateCartQuantityCartTotal(cartId);

    if (success) {
        return res.status(200).json({
            status: 'success',
        });
    }
    return next(
        new AppError(
            `There is at least 1 book that is no longer existed.`,
            404,
        ),
    );
});
