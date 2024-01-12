const express = require('express');

const accountController = require('../controllers/accountControllerUI');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protectPage);

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', accountController.getMyAccount);
router.patch(
    '/updateMe',
    accountController.getMe,
    accountController.updateUser,
);

// Restrict all routes to only role admin after this middleware
router.use(authController.restrictTo(config.role.ADMIN));

router
    .route('/')
    .get(accountController.getAllUsers)
    .post(accountController.createUser);

router
    .route('/:userId')
    .get(accountController.getUser)
    .patch(accountController.updateUser)
    .delete(accountController.deleteUser);

module.exports = router;
