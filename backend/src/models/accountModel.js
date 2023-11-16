// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getByEmail = async (email) => {
    const sqlString = `select * from ACCOUNT where EMAIL = '${email}'`;
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

exports.getDetailedUser = async (userEntity) => {
    const { email, year } = userEntity;
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    request.input('year', sql.Int, year);
    const result = await request.execute('sp_GetDetailedAccount');
    return result;
};

exports.createAccount = async ({
    email,
    phoneNumber,
    fullName,
    password,
    verified,
    token,
    role,
}) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    request.input('phoneNumber', sql.Char, phoneNumber);
    request.input('fullName', sql.NVarChar, fullName);
    request.input('password', sql.NVarChar, password);
    request.input('verified', sql.Bit, verified);
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

exports.updateAccount = async (userEntity) => {
    const {
        email,
        fullName,
        password,
        phoneNumber,
        avatarPath,
        avatarFilename,
        birthday,
        gender,
        tier,
        role,
    } = userEntity;

    const pool = await database.getConnectionPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let checkAccount = false;
    let checkAccountDetail = false;
    let sqlStringAccount = ``;
    let sqlStringAccountDetail = ``;

    // Create Account update string
    if (fullName) {
        checkAccount = true;
        sqlStringAccount += `FULLNAME = '${fullName}',`;
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
        sqlStringAccount += `AVATAR_PATH = '${avatarPath}',AVATAR_FILENAME = '${avatarFilename},'`;
    }
    if (role) {
        checkAccount = true;
        sqlStringAccount += `HROLE = ${role},`;
    }

    // Create Account Detail update string
    if (birthday) {
        checkAccountDetail = true;
        sqlStringAccountDetail += `BIRTHDAY = '${birthday}',`;
    }
    if (gender || gender === 0) {
        checkAccountDetail = true;
        sqlStringAccountDetail += `GENDER = ${gender},`;
    }
    if (tier) {
        checkAccountDetail = true;
        sqlStringAccountDetail += `TIER = ${tier},`;
    }

    if (checkAccount) {
        sqlStringAccount = `update ACCOUNT set ${sqlStringAccount} where email = '${email}'`;
        sqlStringAccount = sqlStringAccount.replace(/, w/, ' w');
        const accountRequest = new sql.Request(transaction);
        await accountRequest.query(sqlStringAccount);
    }
    if (checkAccountDetail) {
        sqlStringAccountDetail = `update ACCOUNT_DETAIL set ${sqlStringAccountDetail} where email = '${email}'`;
        sqlStringAccountDetail = sqlStringAccountDetail.replace(/, w/, ' w');
        const bookDetailRequest = new sql.Request(transaction);
        await bookDetailRequest.query(sqlStringAccountDetail);
    }

    await transaction.commit();
};

exports.getAllUsers = async (userEntity) => {
    const { year, tier, limit, offset } = userEntity;
    let { sortType } = userEntity;
    let sqlString = '';

    if (year) {
        sqlString += `hy.SAVED_YEAR in (${year})`;
    }
    if (tier) {
        sqlString += ` and ad.TIER = ${tier}`;
    }
    const check = sortType[0] === '-';
    if (check) {
        sortType = sortType.substring(1);
    }
    sqlString += ` order by ${sortType} ${check ? 'desc' : 'asc'}`;
    sqlString += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    sqlString = `select [a].[EMAIL] as email, [a].[FULLNAME] as fullName, [a].[PHONE_NUMBER] as phoneNumber,
    [a].[AVATAR_PATH] as avatarPath, [a].[AVATAR_FILENAME] as avatarFilename, [a].[HROLE] as role,
    ad.GENDER as gender, ad.BIRTHDAY as birthday, ad.HPOINT as HPoint, ad.TIER as tier, hy.HPOINT accumulatedHPoint
from ACCOUNT a LEFT join ACCOUNT_DETAIL ad on a.EMAIL = ad.EMAIL
    LEFT join HPOINT_ACCUMULATION_YEAR hy on hy.EMAIL = a.EMAIL where ${sqlString}`;

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};
