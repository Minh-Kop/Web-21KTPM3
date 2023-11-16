// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.createReview = async ({ bookId, orderId, rating, comment }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    request.input('bookId', sql.Char, bookId);
    request.input('rating', sql.Int, rating);
    request.input('comment', sql.NVarChar, comment);
    const result = await request.execute('sp_CreateReview');
    return result.returnValue;
};

exports.updateBookRating = async (bookId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('bookId', sql.Char, bookId);
    const result = await request.execute('sp_UpdateBookRating');
    return result.returnValue;
};

exports.getReviews = async ({ bookId, orderId }) => {
    let sqlString = '';
    if (bookId) {
        sqlString += `r.BOOK_ID = '${bookId}' `;
    }
    if (orderId) {
        sqlString += `and r.ORDER_ID = '${orderId}'`;
    }
    sqlString = `SELECT a.EMAIL email, a.FULLNAME fullName, a.AVATAR_FILENAME avatar, r.BOOK_ID bookId, r.RATING rating, r.REVIEW comment
                from ORDER_REVIEW r join H_ORDER o on r.ORDER_ID = o.ORDER_ID
                    join ACCOUNT a on a.EMAIL = o.EMAIL
                where ${sqlString}`;
    sqlString = sqlString.replace(/where and/, 'where');

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};
