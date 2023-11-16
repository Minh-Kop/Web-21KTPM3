// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

module.exports = {
    async getProvinces() {
        const sqlString = `select [PROV_ID] provId, [PROV_NAME] provName from PROVINCE`;
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query(sqlString);
        return result.recordset;
    },

    async getDistricts(provId) {
        const sqlString = `select [DIST_ID] 'distId', [DIST_NAME] 'distName' from DISTRICT where PROV_ID = '${provId}'`;
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query(sqlString);
        return result.recordset;
    },

    async getWards(distId) {
        const sqlString = `select [WARD_ID] 'wardId', [WARD_NAME] 'wardName' from WARD where DIST_ID = '${distId}'`;
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query(sqlString);
        return result.recordset;
    },

    async getProvinceById(provId) {
        const sqlString = `select [PROV_ID] provId, [PROV_NAME] provName from PROVINCE where PROV_ID = '${provId}'`;
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query(sqlString);
        return result.recordset[0];
    },

    async getDistrictById(distId) {
        const sqlString = `select [DIST_ID] 'distId', [DIST_NAME] 'distName' from DISTRICT where DIST_ID = '${distId}'`;
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query(sqlString);
        return result.recordset[0];
    },

    async getWardById(wardId) {
        const sqlString = `select [WARD_ID] 'wardId', [WARD_NAME] 'wardName' from WARD where WARD_ID = '${wardId}'`;
        const pool = await database.getConnectionPool();
        const request = new sql.Request(pool);
        const result = await request.query(sqlString);
        return result.recordset[0];
    },
};
