const path = require('path');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const router = require('./routes');
const hbs = require('./utils/handlebars')(expressHandlebars);
const { JWT_SECRET: secret, SHOP_URL: shopUrl } = require('./config/config');

// Solve self signed certificate error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Start express app
const app = express();

// 1) GLOBAL MIDDLEWARES
// Implement CORS
const corsOptions = {
    origin: [shopUrl],
    credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
        name: 'jwt',
        secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // maxAge: config.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
            // sameSite: 'none',
            secure: true,
            httpOnly: true,
        },
    })
);

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Set up passport
require('./utils/passport')(app);

// 2) ROUTES
app.get('/', (req, res, next) => {
    res.redirect('/account');
});

app.use(router);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
