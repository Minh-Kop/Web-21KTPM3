// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getPayments = async () => {
    const sqlString = `select [PAYMENT_ID] paymentId, [PAYMENT_PROVIDER] paymentProvider from PAYMENT`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.getPaymentById = async (paymentId) => {
    const sqlString = `select [PAYMENT_ID] paymentId, [PAYMENT_PROVIDER] paymentProvider from PAYMENT where PAYMENT_ID = '${paymentId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};
