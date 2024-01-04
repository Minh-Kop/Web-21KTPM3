// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getAllCategory = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        'select * from CATEGORY where SOFT_DELETE is null',
    );
    return result.recordset;
};

exports.createCategory = async ({ cateName, parentID }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('curr', sql.NVarChar, cateName);
    request.input('parent', sql.Char, parentID);
    const result = await request.execute('sp_createCategory');
    return result;
};

exports.deleteCategory = async (cateId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('id', sql.Char, cateId);
    const result = await request.execute('sp_deleteCategory');
    return result;
};

exports.updateCategory = async ({ cateId, cateName, parentId }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('id', sql.Char, cateId);
    request.input('name', sql.NVarChar, cateName);
    request.input('parent', sql.Char, parentId);
    const result = await request.execute('sp_updateCategory');
    return result;
};
