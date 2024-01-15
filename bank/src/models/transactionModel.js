const sql = require('mssql');

const database = require('../utils/database');

exports.createDeposit = async ({ accountId, deposit }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('accountId', sql.Char, accountId);
    request.input('deposit', sql.Int, deposit);
    const result = await request.execute('sp_CreateDeposit');
    return result;
};

exports.createPaymentTransaction = async ({
    payerId,
    total,
    changedReason,
}) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('payerId', sql.Char, payerId);
    request.input('total', sql.Int, total);
    request.input('changedReason', sql.NVarChar, changedReason);
    const result = await request.execute('sp_CreatePaymentTransaction');
    return result;
};

exports.createRefundTransaction = async (transactionId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('transactionId', sql.Char, transactionId);
    const result = await request.execute('sp_CreateRefundTransaction');
    return result;
};

exports.getTransactions = async (accountId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('accountId', sql.Char, accountId);
    const result = await request.execute('sp_GetTransactions');
    return result.recordset;
};

exports.getTransactionById = async (accountId, transactionId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('accountId', sql.Char, accountId);
    request.input('transactionId', sql.Char, transactionId);
    const result = await request.execute('sp_GetTransactionById');
    return result.recordset[0];
};
