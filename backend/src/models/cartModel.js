const sql = require('mssql');

const database = require('../utils/database');

exports.getCartByUserId = async (userId) => {
    const sqlString = `select * from CART where USERID = '${userId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.updateBookInCart = async ({ cartId, bookId, quantity, isClicked }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('cartId', sql.Char, cartId);
    request.input('bookId', sql.Char, bookId);
    request.input('quantity', sql.Int, +quantity);
    request.input('isClicked', sql.Bit, +isClicked);
    const result = await request.execute('sp_UpdateCart');
    return result.returnValue;
};

exports.updateBooksInCart = async ({ cartId, isClicked }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('cartId', sql.Char, cartId);
    request.input('isClicked', sql.Bit, +isClicked);
    const result = await request.execute('sp_UpdateBooksInCart');
    return result.returnValue;
};

exports.addBookToCart = async ({ cartId, bookId, quantity, isClicked }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('cartId', sql.Char, cartId);
    request.input('bookId', sql.Char, bookId);
    request.input('quantity', sql.Int, +quantity);
    request.input('isClicked', sql.Bit, +isClicked);
    const result = await request.execute('sp_AddBookToCart');
    return result.returnValue;
};

exports.updateCartQuantityCartTotal = async (cartId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('cartId', sql.Char, cartId);
    const result = await request.execute('sp_UpdateCartQuantityCartTotal');
    return result.returnValue;
};

exports.deleteFromCart = async (cartId, bookId) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('cartId', sql.Char, cartId);
    request.input('bookId', sql.Char, bookId);
    const result = await request.execute('sp_DeleteBookFromCart');
    return result.rowsAffected[0];
};

exports.deleteClickedBooksFromCart = async (userId, orderId) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('userId', sql.Char, userId);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_DeleteClickedBooksFromCart');
    return result.rowsAffected[0];
};
