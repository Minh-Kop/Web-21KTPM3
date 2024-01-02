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

exports.createAccount = async ({ username, password }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('username', sql.NVarChar, username);
    request.input('password', sql.NVarChar, password);
    const result = await request.execute('sp_CreateAccount');
    return result;
};

exports.getAllUsers = async (userEntity) => {
    const { limit, offset } = userEntity;
    let { sortType } = userEntity;
    let sqlString = '';

    const check = sortType[0] === '-';
    if (check) {
        sortType = sortType.substring(1);
    }
    sqlString += ` order by ${sortType} ${check ? 'desc' : 'asc'}`;
    sqlString += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    sqlString = `
        select a.USERID userId, [a].USERNAME as username, [a].[EMAIL] as email, [a].[FULLNAME] as fullName, [a].[PHONE_NUMBER] as phoneNumber, [a].[AVATAR_PATH] as avatarPath, [a].[HROLE] as role, a.GENDER as gender, a.BIRTHDAY as birthday
        from ACCOUNT a ${sqlString}`;

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};
