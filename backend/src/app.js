const path = require('path');
const express = require('express');
// const morgan = require('morgan');
const expressHandlebars = require('express-handlebars');
const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');

const { JWT_SECRET: secret } = require('./config/config');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const categoryController = require('./controllers/categoryControllerUI');
const cartController = require('./controllers/cartControllerUI');
const router = require('./routes');
const hbs = require('./utils/handlebars')(expressHandlebars);

// Start express app
const app = express();

app.set('trust proxy', true);

// 1) GLOBAL MIDDLEWARES
// Implement CORS
const corsOptions = {
    origin: ['http://localhost:3000', 'https://group-6-e-commerce.vercel.app'],
    credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Set security HTTP headers
// app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    // app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in hour!',
});
app.use('/api', limiter);

// Serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Set up template engine
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'hbs');

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Parse cookie
app.use(
    session({
        name: 'session',
        secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // maxAge: config.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
            // sameSite: 'none',
            secure: true,
            httpOnly: true,
        },
    }),
);

// Set up passport
require('./utils/passport')(app);

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Create category tree
app.use(async (req, res, next) => {
    const categoryTree = await categoryController.getCategoryTree();
    req.categoryTree = categoryTree;

    if (req.isAuthenticated()) {
        const { userId } = req.user;
        const cart = await cartController.getCart(userId);
        req.cart = cart;
    }

    next();
});

// 2) ROUTES
app.use(router);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
