// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.countOrders = async (uid) => {
    const sqlString = `select ORDER_STATE orderstate, count(*) totalNumber from ORDER_STATE os join H_ORDER o on os.ORDER_ID = o.ORDER_ID where USERID = '${uid}' group by ORDER_STATE`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
}

exports.createOrder = async ({
    userId,
    addrId,
    merchandiseSubtotal,
    shippingFee,
}) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('userId', sql.Char, userId);
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

exports.getDetailedOrder = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_GetDetailedOrder');
    return result.recordsets;
};

exports.getUserOrders = async (entity) => {
    const { uid, orderState, limit, offset } = entity;
    let state = orderState == 6 ? null : orderState;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('USERID', sql.Char, uid);
    request.input('orderState', sql.Int, state);
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

exports.deleteOrder = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_DeleteOrder');
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
