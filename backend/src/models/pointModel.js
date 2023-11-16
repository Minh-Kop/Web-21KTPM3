const sql = require('mssql');

const database = require('../utils/database');

exports.getByEmail = async ({ email, changedType }) => {
    const pool = await database.getConnectionPool();

    let sqlString = `SELECT [EMAIL] email, [CHANGED_TYPE] changedType, [CHANGED_TIME] changedTime, [CHANGED_POINTS] changedPoints,
        [CHANGED_REASON] changedReason from HPOINT_HISTORY where EMAIL = '${email}'`;
    if (changedType) {
        sqlString += ` and CHANGED_TYPE = ${changedType}`;
    }
    sqlString += ' order by CHANGED_TIME desc';

    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.getAll = async (changedType) => {
    const pool = await database.getConnectionPool();

    let sqlString = `SELECT [EMAIL] email, [CHANGED_TYPE] changedType, [CHANGED_TIME] changedTime, [CHANGED_POINTS] changedPoints,
        [CHANGED_REASON] changedReason from HPOINT_HISTORY`;
    if (changedType) {
        sqlString += ` where CHANGED_TYPE = ${changedType}`;
    }
    sqlString += ' order by CHANGED_TIME desc';

    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};
