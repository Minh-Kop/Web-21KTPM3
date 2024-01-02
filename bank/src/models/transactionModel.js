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
