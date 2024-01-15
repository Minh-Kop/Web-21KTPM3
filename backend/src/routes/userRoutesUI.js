const express = require('express');

const accountController = require('../controllers/accountControllerUI');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protectPage);

router.get('/me', accountController.getMyAccount);

// Restrict all routes to only role admin after this middleware
router.use(authController.restrictTo(config.role.ADMIN));

router.route('/createUser').get(accountController.getCreateUserPage);

router.route('/').get(accountController.getAllUsers);

router.route('/:userId').get(accountController.getUser);

module.exports = router;
