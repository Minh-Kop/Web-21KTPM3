// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getByUserId = async (userId) => {
    const sqlString = `select * from ACCOUNT where userId = '${userId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.getByEmail = async (email) => {
    const sqlString = `select * from ACCOUNT where EMAIL = '${email}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.getByUsername = async (username, isSignUp = false) => {
    let sqlString = `select * from ACCOUNT where username = '${username}'`;
    if (!isSignUp) {
        sqlString += ' and SOFT_DELETE = 0';
    }
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.getByPhone = async (phoneNumber) => {
    const sqlString = `select * from ACCOUNT where PHONE_NUMBER = '${phoneNumber}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.getDetailedUser = async (userId) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('userId', sql.Char, userId);
    const result = await request.execute('sp_GetDetailedAccount');
    return result;
};

exports.createAccount = async ({
    email,
    username,
    password,
    verified,
    token,
    isOauth2,
    role,
}) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    request.input('username', sql.NVarChar, username);
    request.input('password', sql.NVarChar, password);
    request.input('verified', sql.Bit, verified);
    request.input('isOauth2', sql.Bit, isOauth2);
    request.input('token', sql.Char, token);
    request.input('role', sql.Int, role);
    const result = await request.execute('sp_CreateAccount');
    return result;
};

exports.verifyAccount = async (token) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('token', sql.Char, token);
    const result = await request.execute('sp_VerifyAccount');
    return result.returnValue;
};

exports.updateAccount = async ({
    userId,
    fullName,
    password,
    phoneNumber,
    avatarPath,
    birthday,
    gender,
    role,
}) => {
    const pool = await database.getConnectionPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let checkAccount = false;
    let sqlStringAccount = ``;

    // Create Account update string
    if (fullName) {
        checkAccount = true;
        sqlStringAccount += `FULLNAME = N'${fullName}',`;
    }
    if (password) {
        checkAccount = true;
        sqlStringAccount += `ENC_PWD = '${password}',`;
    }
    if (phoneNumber) {
        checkAccount = true;
        sqlStringAccount += `PHONE_NUMBER = '${phoneNumber}',`;
    }
    if (avatarPath) {
        checkAccount = true;
        sqlStringAccount += `AVATAR_PATH = '${avatarPath}',`;
    }
    if (role) {
        checkAccount = true;
        sqlStringAccount += `HROLE = ${role},`;
    }
    if (birthday) {
        checkAccount = true;
        sqlStringAccount += `BIRTHDAY = '${birthday}',`;
    }
    if (gender || gender === 0) {
        checkAccount = true;
        sqlStringAccount += `GENDER = ${gender},`;
    }

    if (checkAccount) {
        sqlStringAccount = `update ACCOUNT set ${sqlStringAccount} where userId = '${userId}'`;
        sqlStringAccount = sqlStringAccount.replace(/, w/, ' w');
        const accountRequest = new sql.Request(transaction);
        await accountRequest.query(sqlStringAccount);
    }

    await transaction.commit();
};

exports.countUser = async () => {
    const sqlString = `select count(userID) totalNumber from ACCOUNT where SOFT_DELETE = 0`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    const { totalNumber } = result.recordset[0];
    return totalNumber;
};

exports.getAllUsers = async (userEntity) => {
    const { limit, page } = userEntity;

    const offset = (page - 1) * limit;
    //let { sortType } = userEntity;
    let sqlString = '';

    // const check = sortType[0] === '-';
    // if (check) {
    //     sortType = sortType.substring(1);
    // }
    // sqlString += ` order by ${sortType} ${check ? 'desc' : 'asc'}`;
    sqlString += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    sqlString = `
        select a.USERID userId, [a].USERNAME as username, [a].[EMAIL] as email, [a].[FULLNAME] as fullName, [a].[PHONE_NUMBER] as phoneNumber, [a].[AVATAR_PATH] as avatarPath, [a].[HROLE] as role, a.GENDER as gender, a.BIRTHDAY as birthday
        from ACCOUNT a where SOFT_DELETE = 0 ORDER BY a.USERID ${sqlString}`;
    
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.deleteAccount = async (userId) => {
    const sqlString = `update ACCOUNT set SOFT_DELETE = 1 where USERID = '${userId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.rowsAffected[0];
};
