// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.createVoucher = async ({
    voucherTypeId,
    percentageDiscount,
    minPrice,
    maxDiscountPrice,
    startDate,
    endDate,
    maxAmount,
}) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('voucherTypeId', sql.Char, voucherTypeId);
    request.input('percentageDiscount', sql.Int, percentageDiscount);
    request.input('minPrice', sql.Int, minPrice);
    request.input('maxDiscountPrice', sql.Int, maxDiscountPrice);
    request.input('startDate', sql.DateTime, startDate);
    request.input('endDate', sql.DateTime, endDate);
    request.input('maxAmount', sql.Int, maxAmount);
    const result = await request.execute('sp_CreateVoucher');
    return result.rowsAffected[0];
};

exports.getAllVouchers = async () => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    const result = await request.execute('sp_GetAllVouchers');
    return result.recordset;
};

exports.getAllUserVouchers = async (email) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('email', sql.NVarChar, email);
    const result = await request.execute('sp_GetAllUserVouchers');
    return result.recordset;
};

exports.getVouchersByOrderId = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_GetVouchersByOrderId');

    const orderIdList = result.recordset.map((el) => el.voucherId);
    return orderIdList;
};

exports.useVoucher = async (orderId, voucherId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    request.input('voucherId', sql.Char, voucherId);
    const result = await request.execute('sp_AddVoucher');
    return result.returnValue;
};

exports.deleteVoucher = async (voucherId) => {
    const sqlString = `delete from VOUCHER where VOUCHER_ID = '${voucherId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.rowsAffected[0];
};
