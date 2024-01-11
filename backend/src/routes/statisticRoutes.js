const express = require('express');

const statisticController = require('../controllers/statisticController');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

router.use(authController.restrictTo(config.role.ADMIN));

router.get('/', statisticController.getStatistic);

module.exports = router;
