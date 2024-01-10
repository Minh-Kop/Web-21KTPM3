require('dotenv').config();

const config = {
    NODE_ENV: process.env.NODE_ENV,

    PORT: process.env.PORT || 3002,

    SHOP_URL: process.env.SHOP_URL,

    DATABASE: {
        server: process.env.DB_SERVER,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
    },

    transferType: {
        OUT_PAYER: 1,
        IN_PAYEE: 2,
    },

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    JWT_EXP_TIME: 60 * 60,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
    NUMBER_BYTE_VERIFY_TOKEN: 256 / 8,
    NUMBER_BYTE_SALT: 16 / 8,
};

module.exports = config;
