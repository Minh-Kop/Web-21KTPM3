// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getAllCategory = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        'select * from CATEGORY where SOFT_DELETE <> 1 ORDER by CATE_ID',
    );
    return result.recordset;
};

exports.getAllCategoryWithParent = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        `select c1.CATE_ID, c1.PARENT_ID, c1.CATE_NAME, c2.CATE_NAME as 'PARENT_NAME' , c1.SOFT_DELETE from CATEGORY c1 join CATEGORY c2 on c1.PARENT_ID = c2.CATE_ID where c1.SOFT_DELETE <> 1`,
    );
    return result.recordset;
};

exports.getCategory = async (cateId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        `select * from CATEGORY where SOFT_DELETE <> 1 and CATE_ID = '${cateId}'`,
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

exports.getAllParentCategory = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        'select distinct c1.CATE_ID, c1.PARENT_ID, c1.CATE_NAME, c1.SOFT_DELETE from CATEGORY c1 join CATEGORY c2 on c1.CATE_ID = c2.PARENT_ID where c1.SOFT_DELETE <> 1',
    );
    return result.recordset;
};

exports.getChildrenCategory = async (cateId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        `select * from CATEGORY WHERE PARENT_ID = '${cateId}' and SOFT_DELETE <> 1`,
    );
    return result.recordset;
};

exports.getParent = async (cateId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(
        `select distinct c1.CATE_ID, c1.PARENT_ID, c1.CATE_NAME, c1.SOFT_DELETE from CATEGORY c1 join CATEGORY c2 on c1.CATE_ID = c2.PARENT_ID where c1.SOFT_DELETE <> 1 and c2.CATE_ID = '${cateId}'`,
    );
    return result.recordset;
};
