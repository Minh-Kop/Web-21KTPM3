const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.route('/login').get(authController.getLoginPage);
router.route('/signup').get(authController.getSignupPage);
router.delete('/logout', authController.logOutWebsite);

module.exports = router;
