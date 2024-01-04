// const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('./passport')
// const session = require('express-session');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const router = require('./routes');
// const config = require('./config');

// const authRouter = require('./routes/authRouter')
// app.use('/api/auth', authRouter)

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
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Parse cookie
// app.use(
//     session({
//         name: 'jwt',
//         secret: 'khoi',
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             maxAge: config.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
//             sameSite: 'none',
//             secure: true,
//             httpOnly: true,
//         },
//     }),
// );

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

// 2) ROUTES
app.use(router);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
