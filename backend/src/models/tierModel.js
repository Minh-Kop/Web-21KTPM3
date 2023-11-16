const sql = require('mssql');

const database = require('../utils/database');

exports.updateTier = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.execute('sp_UpdateTier');
    return result.returnValue;
};

exports.giveBirthdayGift = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.execute('sp_GiveBirthdayGift');
    return result.returnValue;
};
