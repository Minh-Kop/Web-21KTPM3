// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getAllCategory = async () => {
    try {
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query('select * from CATEGORY');
        return result.recordset;
    } catch (err) {
        console.log(err);
    }
};
