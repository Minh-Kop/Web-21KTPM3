// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const config = require('../config');

exports.getConnectionPool = async () => {
    let pool = null;

    const finalConfig = {
        ...config.DATABASE,
        // driver: 'msnodesqlv8',
        options: {
            trustServerCertificate: true,
            // trustedConnection: true,
        },
    };

    try {
        pool = await new sql.ConnectionPool(finalConfig).connect();
    } catch (err) {
        console.log(err);
    }
    return pool;
};
