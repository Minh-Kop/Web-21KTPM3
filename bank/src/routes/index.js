const express = require('express');

const { protectPage } = require('../controllers/authController');
const accountRouter = require('./accountRoutes');
const accountRouterUI = require('./accountRoutesUI');
const authRouter = require('./authRoutes');

const router = express.Router();

router.use('/', authRouter);
router.use('/api/account', accountRouter);
router.use('/account', protectPage, accountRouterUI);

module.exports = router;
