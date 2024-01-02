const express = require('express');

const { protectPage } = require('../controllers/authController');
const authRouter = require('./authRoutes');
const accountRouter = require('./accountRoutes');
const accountRouterUI = require('./accountRoutesUI');
const transactionRouter = require('./transactionRoutes');

const router = express.Router();

router.use('/', authRouter);
router.use('/api/account', accountRouter);
router.use('/account', protectPage, accountRouterUI);
router.use('/api/transaction', transactionRouter);

module.exports = router;
