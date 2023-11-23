const express = require('express');

const pointController = require('../controllers/pointController');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

router.get('/me', pointController.getMe, pointController.getByEmail);

// Restrict all routes to only role admin after this middleware
router.use(authController.restrictTo(config.role.ADMIN));

router.get('/', pointController.getAll);
router.get('/:email', pointController.getByEmail);

module.exports = router;
