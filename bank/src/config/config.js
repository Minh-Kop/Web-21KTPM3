require('dotenv').config();

const config = {
    NODE_ENV: process.env.NODE_ENV,

    PORT: process.env.PORT || 3002,

    DATABASE: {
        server: process.env.DB_SERVER,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
    },

    role: {
        USER: 1,
        ADMIN: 2,
    },

    JWT_EXP_TIME: 60 * 60,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
    NUMBER_BYTE_VERIFY_TOKEN: 256 / 8,
    NUMBER_BYTE_SALT: 16 / 8,
};

module.exports = config;
