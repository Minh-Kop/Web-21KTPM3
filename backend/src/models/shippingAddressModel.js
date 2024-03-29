// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getAllShippingAddressesByUserId = async (userId) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('userId', sql.Char, userId);
    const result = await request.execute(
        'sp_GetAllUserShippingAddressesByUserId',
    );
    return result.recordset;
};

exports.getShippingAddressesByUserId = async (userId) => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('userId', sql.NVarChar, userId);
    const result = await request.execute('sp_GetAllUserShippingAddresses');
    return result.recordset;
};

exports.getShippingAddressesById = async (id) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('id', sql.Char, id);
    const result = await request.execute('sp_GetShippingAddressById');
    return result.recordset[0];
};

exports.createShippingAddress = async (entity) => {
    const {
        userId,
        address,
        wardId,
        distId,
        provId,
        fullName,
        phoneNumber,
        isDefault,
        lat,
        lng,
    } = entity;
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('userId', sql.NVarChar, userId);
    request.input('address', sql.NVarChar, address);
    request.input('wardId', sql.Char, wardId);
    request.input('distId', sql.Char, distId);
    request.input('provId', sql.Char, provId);
    request.input('fullName', sql.NVarChar, fullName);
    request.input('phoneNumber', sql.Char, phoneNumber);
    request.input('isDefault', sql.Bit, isDefault);
    request.input('lat', sql.Float, lat);
    request.input('lng', sql.Float, lng);
    const result = await request.execute('sp_CreateShippingAddress');
    return result.returnValue;
};

exports.updateShippingAddress = async (entity) => {
    const { userId, addrId, isDefault } = entity;
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('addrId', sql.Char, addrId);
    request.input('userId', sql.Char, userId);
    request.input('isDefault', sql.Bit, isDefault);
    const result = await request.execute('sp_UpdateShippingAddress');
    return result.rowsAffected[0];
};

exports.deleteShippingAddress = async (addrId) => {
    const sqlString = `update SHIPPING_ADDRESS set SOFT_DELETE = 1 where ADDR_ID = '${addrId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.rowsAffected[0];
};
