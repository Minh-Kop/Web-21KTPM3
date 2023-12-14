const express = require('express');

const authController = require('../controllers/authController');
const authRoutes = require('./authRoutes');
const categoryRouter = require('./categoryRoutes');
const categoryRouterUI = require('./categoryRoutesUI');
const bookRouter = require('./bookRoutes');
const bookRouterUI = require('./bookRoutesUI');
const userRouter = require('./userRoutes');
const cartRouter = require('./cartRoutes');
// const voucherRouter = require('./voucherRoutes');
// const locationRouter = require('./locationRoutes');
// const shippingAddressRouter = require('./shippingAddressRoutes');
// const checkoutRouter = require('./checkoutRoutes');
// const paymentRouter = require('./paymentRoutes');
// const orderRouter = require('./orderRoutes');
// const reviewRouter = require('./reviewRoutes');
// const searchRouter = require('./searchRoutes');
// const pointRouter = require('./pointRoutes');

const router = express.Router();

router.use('/', authRoutes);
router.use('/api/category', categoryRouter);
router.use('/category', categoryRouterUI);
router.use('/api/books', bookRouter);
router.use('/books', bookRouterUI);
router.use('/api/users', userRouter);
router.use('/api/cart', authController.protect, cartRouter);
// router.use('/api/voucher', authController.protect, voucherRouter);
// router.use('/api/location', locationRouter);
// router.use(
//     '/api/shippingAddress',
//     authController.protect,
//     shippingAddressRouter,
// );
// router.use('/api/checkout', checkoutRouter);
// router.use('/api/payment', paymentRouter);
// router.use('/api/order', authController.protect, orderRouter);
// router.use('/api/review', reviewRouter);
// router.use('/api/search', searchRouter);
// router.use('/api/point', authController.protect, pointRouter);

module.exports = router;
