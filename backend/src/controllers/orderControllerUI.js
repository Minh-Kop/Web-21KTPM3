const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const orderModel = require('../models/orderModel');
const bookModel = require('../models/bookModel');

const bankUrl = config.BANK_URL;

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
    const {
        orderState: strOrderState,
        limit: strLimit,
        page: strPage,
    } = req.query;
    const orderState = +strOrderState;

    if (!orderState) {
        return res.redirect('/order/me?orderState=6');
    }

    const page = +strPage || 1;
    const limit = +strLimit || 10;
    const offset = (page - 1) * limit;

    const { user, cart, categoryTree } = req;
    const { userId } = user;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    const returnedOrders = await orderModel.getUserOrders({
        userId,
        orderState,
        limit,
        offset,
    });

    const tempOrderNumber = await orderModel.countOrders(userId);
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
        if (orderStatesDict.has(order.orderState)) {
            orderStatesDict.get(order.orderState).totalNumber =
                order.totalNumber;
        }
    });

    orderNumber = Array.from(orderStatesDict.values());

    const { totalNumber } = orderNumber.find(
        (order) => order.orderstate === orderState,
    );

    const totalPages = Math.ceil(parseFloat(totalNumber) / limit);
    returnedOrders.forEach((order) => {
        order.orderDate = moment(order.orderDate)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm');
        order.totalPaymentString = order.totalPayment.toLocaleString('vi-VN');
        order.shippingFeeString = order.shippingFee.toLocaleString('vi-VN');
    });
    const orders = await Promise.all(
        returnedOrders.map(async (order) => {
            const books = await bookModel.getBooksByOrderId(order.orderId);
            books.forEach((book) => {
                book.unitPrice = book.unitPrice.toLocaleString('vi-VN');
            });
            return {
                ...order,
                books,
            };
        }),
    );

    const showButton = !!(orderState === 1 || orderState === 2);

    res.render('account/order_list', {
        title: 'Đơn hàng của tôi',
        status: 'success',
        ordersLength: orders.length,
        orders,
        showButton,
        bankUrl,
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
        orderState,
        currentUrl: url,
        categoryTree,
        isAdmin,
    });
});

const createOrderStateList = (total) => {
    const orderStates = [];
    for (let i = 1; i <= 3; i++) {
        orderStates.push({
            orderState: i,
            totalNumber: i === 0 ? total : 0,
        });
    }
    orderStates.push({
        orderState: -1,
        totalNumber: 0,
    });
    return orderStates;
};

exports.getAllOrders = catchAsync(async (req, res, next) => {
    const {
        orderState: strOrderState,
        limit: strLimit,
        page: strPage,
    } = req.query;
    const orderState = +strOrderState;

    if (!orderState) {
        return res.redirect('/admin/order?orderState=1');
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
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';

    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    const returnedOrders = await orderModel.getAllOrders({
        orderState,
        limit,
        offset,
    });
    const total = returnedOrders.length;

    const orderStatesDB = await orderModel.countOrders();
    let orderStates = createOrderStateList(total);

    const orderStatesMap = new Map(
        orderStates.map((item) => [item.orderState, item]),
    );
    orderStatesDB.forEach((el) => {
        if (orderStatesMap.has(el.orderState)) {
            orderStatesMap.get(el.orderState).totalNumber = el.totalNumber;
        }
    });
    orderStates = Array.from(orderStatesMap.values());

    const { totalNumber } = orderStates.find(
        (el) => el.orderState === orderState,
    );
    const totalPages = Math.ceil(parseFloat(totalNumber) / limit);
    returnedOrders.forEach((order) => {
        order.orderDate = moment(order.orderDate)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm');
        order.totalPaymentString = order.totalPayment.toLocaleString('vi-VN');
        order.shippingFeeString = order.shippingFee.toLocaleString('vi-VN');
    });
    const orders = await Promise.all(
        returnedOrders.map(async (order) => {
            const books = await bookModel.getBooksByOrderId(order.orderId);
            books.forEach((book) => {
                book.unitPrice = book.unitPrice.toLocaleString('vi-VN');
            });
            return {
                ...order,
                books,
            };
        }),
    );

    res.render('orderCRUD/order', {
        layout: 'admin',
        headerName: 'Danh sách đơn hàng',
        title: 'Order management',
        order: true,
        ordersLength: orders.length,
        orders,
        bankUrl,
        link: newUrl,
        isLoggedIn,
        ...user,
        ...cart,
        page,
        limit,
        totalPages,
        orderStates,
        orderState: +orderState,
        currentUrl: url,
        categoryTree,
        isAdmin,
    });
});

exports.getDetailOrderForAdmin = catchAsync(async (req, res, next) => {
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

    if (!deliveryInformation || !tempOrderStates.length) {
        return next(new AppError('Order not found.', 404));
    }

    const orderStates = tempOrderStates.map((el) => ({
        ...el,
        createdTime: moment(el.createdTime)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm'),
    }));
    const { orderState } = orderStates[0];

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

    res.render('orderCRUD/orderDetail', {
        title: 'Chi tiết đơn hàng',
        navbar: () => 'empty',
        footer: () => 'empty',
        status: 'success',
        data: {
            deliveryInformation: deliveryInformation[0],
            orderStates,
            booksOrdered,
            orderInformation: orderInformation[0],
        },
        orderState,

        isLoggedIn,
        ...user,
        ...cart,
        categoryTree,
        currentUrl: url,
        isAdmin,
    });
});
