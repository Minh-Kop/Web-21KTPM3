// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.getAll = async () => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query('select * from PUBLISHER');
    const finalResult = result.recordset.map((el) => {
        return {
            pubId: el.PUB_ID,
            pubName: el.PUB_NAME,
        };
    });
    return finalResult;
};
