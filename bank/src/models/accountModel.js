const sql = require('mssql');

const database = require('../utils/database');

exports.getByUserId = async (userId) => {
    const sqlString = `select * from ACCOUNT where userId = '${userId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.getByUsername = async (username) => {
    const sqlString = `select * from ACCOUNT where username = '${username}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.getDetailedUser = async (accountId) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('accountId', sql.Char, accountId);
    const result = await request.execute('sp_GetDetailedAccount');
    return result;
};

exports.createAccount = async ({ username, password, isOauth2 }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('username', sql.NVarChar, username);
    request.input('password', sql.NVarChar, password);
    request.input('isOauth2', sql.Bit, isOauth2);
    const result = await request.execute('sp_CreateAccount');
    return result;
};

exports.updatePassword = async ({ accountId, password }) => {
    const sqlString = `update ACCOUNT set ENC_PWD = '${password}' where ACCOUNTID = '${accountId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result;
};
