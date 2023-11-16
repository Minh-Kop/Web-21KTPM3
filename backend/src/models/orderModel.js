// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.createInitialOrder = async (entity) => {
    const { email, addrId, merchandiseSubtotal, shippingFee } = entity;
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    request.input('addrId', sql.Char, addrId);
    request.input('merchandiseSubtotal', sql.Int, merchandiseSubtotal);
    request.input('shippingFee', sql.Int, shippingFee);
    const result = await request.execute('sp_CreateOrder');
    return result;
};

exports.createDetailedOrder = async (entity) => {
    const { orderId, bookId, quantity, price } = entity;
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    request.input('bookId', sql.Char, bookId);
    request.input('quantity', sql.Int, quantity);
    request.input('price', sql.Int, price);
    const result = await request.execute('sp_CreateOrderDetail');
    return result.returnValue;
};

exports.getInitialOrder = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_GetInitialOrder');
    return result.recordsets;
};

exports.getPrice = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_GetPrice');
    return result.recordset[0];
};

exports.getDetailedOrder = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_GetDetailedOrder');
    return result.recordsets;
};

exports.getUserOrders = async (entity) => {
    const { email, orderState, limit, offset } = entity;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    request.input('orderState', sql.Int, +orderState);
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);
    const result = await request.execute('sp_GetUserOrders');
    return result.recordset;
};

exports.getAllOrders = async (entity) => {
    const { orderState, limit, offset } = entity;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderState', sql.Int, +orderState);
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);
    const result = await request.execute('sp_GetAllOrders');
    return result.recordset;
};

exports.getTotalPayment = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute(`sp_IsPlacedOrder`);

    if (result.returnValue !== 1) {
        return {
            totalPayment: null,
        };
    }
    return result.recordset[0];
};

exports.getOrderDetail = async (orderId) => {
    const sqlString = `select BOOK_ID bookId, ORDER_QUANTITY quantity from ORDER_DETAIL where ORDER_ID = '${orderId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.deleteAllInitialOrders = async (email) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    const result = await request.execute('sp_DeleteAllInitialOrders');
    return result.returnValue;
};

exports.updateOrder = async ({
    orderId,
    addrId,
    shippingFee,
    paymentId,
    useHPoint,
    hPoint,
}) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    request.input('addrId', sql.Char, addrId);
    request.input('shippingFee', sql.Int, shippingFee);
    request.input('paymentId', sql.Char, paymentId);
    request.input('useHPoint', sql.Bit, useHPoint);
    request.input('hPoint', sql.Int, hPoint);
    const result = await request.execute('sp_UpdateOrder');
    return result.returnValue;
};

exports.updateState = async (orderId, orderState) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    request.input('orderState', sql.Int, orderState);
    const result = await request.execute('sp_CreateNewState');
    return result.returnValue;
};
