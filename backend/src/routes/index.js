const express = require('express');

const authController = require('../controllers/authController');
const authRoutes = require('./authRoutes');
const categoryRouter = require('./categoryRoutes');
const categoryRouterUI = require('./categoryRoutesUI');
const bookRouter = require('./bookRoutes');
const bookRouterUI = require('./bookRoutesUI');
const userRouter = require('./userRoutes');
const userRouterUI = require('./userRoutesUI');
const cartRouter = require('./cartRoutes');
const cartRouterUI = require('./cartRoutesUI');
const mainPage = require('../controllers/bookControllerUI');

const locationRouter = require('./locationRoutes');
const shippingAddressRouter = require('./shippingAddressRoutes');
const shippingAddressRouterUI = require('./shippingAddressRoutesUI');
const checkoutRouter = require('./checkoutRoutes');
const checkoutRouterUI = require('./checkoutRoutesUI');
// const checkoutRouter = require('./checkoutRoutes');
// const paymentRouter = require('./paymentRoutes');
const orderRouter = require('./orderRoutes');
const orderRouterUI = require('./orderRoutesUI');
// const reviewRouter = require('./reviewRoutes');
// const searchRouter = require('./searchRoutes');

const router = express.Router();

router.use('/', authRoutes);
router.use('/api/category', categoryRouter);
router.use('/category', categoryRouterUI);
router.use('/api/books', bookRouter);
router.use('/books', bookRouterUI);
router.use('/api/users', userRouter);
router.use('/users', userRouterUI);
router.use('/api/cart', authController.protect, cartRouter);
router.use('/cart', authController.protectPage, cartRouterUI);
router.use('/mainPage', mainPage.renderMainPage);
router.use('/api/location', locationRouter);
router.use(
    '/api/shippingAddress',
    authController.protect,
    shippingAddressRouter,
);
router.use(
    '/shippingAddress',
    authController.protectPage,
    shippingAddressRouterUI,
);
router.use('/api/checkout', checkoutRouter);
router.use('/checkout', authController.protectPage, checkoutRouterUI);
// router.use('/api/checkout', checkoutRouter);
// router.use('/api/payment', paymentRouter);
router.use('/api/order', authController.protect, orderRouter);
router.use('/order', authController.protectPage, orderRouterUI);
// router.use('/api/review', reviewRouter);
// router.use('/api/search', searchRouter);

module.exports = router;
