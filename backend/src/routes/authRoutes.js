const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.route('/login').get(authController.getLoginPage);
router.route('/signup').get(authController.getSignupPage);

module.exports = router;
