const express = require('express');

// const authController = require('../controllers/authController');
const accountRouter = require('./accountRoutes');
// const userRouterUI = require('./userRoutesUI');

const router = express.Router();

// router.use('/', authRoutes);
router.use('/api/account', accountRouter);

module.exports = router;
