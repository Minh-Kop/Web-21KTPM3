const sql = require('mssql');

const database = require('../utils/database');

exports.getSOrdernRevenue = async () => {
    const sqlString = `select count(o.ORDER_ID) totalSuccessfulOrder, sum(TOTAL_PAYMENT) totalRevenue 
                        FROM H_ORDER o
                        JOIN (
                            SELECT ORDER_ID, ORDER_STATE,
                                ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
                            FROM ORDER_STATE
                        ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
                        WHERE os.ORDER_STATE = 3`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};
exports.getStatistic = async () => {
    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    const result = await request.execute(
        'sp_GetAllUserShippingAddressesByUserId',
    );
    return result.recordset;
};
