require('dotenv').config();

const config = {
    NODE_ENV: process.env.NODE_ENV,

    PORT: process.env.PORT || 3001,

    BANK_URL: process.env.BANK_URL,

    DATABASE: {
        server: process.env.DB_SERVER,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
    },

    NO_TOKEN_URL: ['/auth', '/location', '/category', '/product'],

    priceRanges: [
        {
            price: 'all',
            title: 'Tất cả',
        },
        {
            price: '0,150000',
            title: '0 - 150.000 VNĐ',
        },
        {
            price: '150000,300000',
            title: '150.000 - 300.000 VNĐ',
        },
        {
            price: '300000,450000',
            title: '300.000 - 450.000 VNĐ',
        },
        {
            price: '450000,600000',
            title: '450.000 - 600.000 VNĐ',
        },
    ],

    sortList: [
        {
            value: 'book_discounted_price',
            title: 'Giá bán',
        },
        {
            value: '-avg_rating',
            title: 'Rating trung bình',
        },
        {
            value: '-discounted_number',
            title: 'Chiết khấu',
        },
    ],

    limitList: [
        {
            value: 12,
        },
        {
            value: 24,
        },
        {
            value: 48,
        },
    ],

    role: {
        USER: 1,
        ADMIN: 2,
    },

    payment: {
        PAYPAL: 'PayPal',
        MOMO: 'MoMo',
        COD: 'COD',
    },

    currency: {
        USD: 'usd',
        VND: 'vnd',
        ETH: 'eth',
    },

    pointChangedType: {
        RECEIVE: 1,
        ACCUMULATE: 2,
        USE: -1,
    },

    tier: {
        MEMBER: 1,
        VIP: 2,
        HVIP: 3,
    },

    orderState: {
        PENDING: 1,
        CANCEL: -1,
        SHIPPING: 2,
        SUCCESS: 3,
        REFUNDING: -2,
        REFUNDED: -3,
    },

    COULDINARY_CONFIG: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    },

    CLOUDINARY_PRODUCT_PATH: 'fabook/products/',
    CLOUDINARY_AVATAR_PATH: 'fabook/avatars/',

    JWT_EXP_TIME: 60 * 60,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
    NUMBER_BYTE_VERIFY_TOKEN: 256 / 8,
    NUMBER_BYTE_SALT: 16 / 8,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,

    MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE,
    MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY,
    MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY,

    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_SECRET: process.env.PAYPAL_SECRET,

    OPENROUTESERVICE_API_KEY: process.env.OPENROUTESERVICE_API_KEY,

    BEST_SELLER_LIMIT: 4,
    PRODUCT_IMAGE_NUMBER_LIMIT: 10,
    RELATED_PRODUCT_LIMIT: 4,
    AVATAR_IMAGE_NUMBER_LIMIT: 1,

    SHOP_LAT: 10.762595373064496,
    SHOP_LONG: 106.6823047396491,
};

module.exports = config;
