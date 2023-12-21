const express = require('express');

const accountController = require('../controllers/accountController');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

router.post('/signup', authController.signUp);
router.patch('/verify/:token', authController.verify);
router.post('/login', authController.login);
router.get('/logout', authController.logOut);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', accountController.getMe, accountController.getUser);
router.patch(
    '/updateMe',
    accountController.getMe,
    accountController.updateUser,
);

router
    .route('/avatar')
    .patch(accountController.uploadAvatar, accountController.updateAvatar);

// Restrict all routes to only role admin after this middleware
router.use(authController.restrictTo(config.role.ADMIN));

router
    .route('/')
    .get(accountController.getAllUsers)
    .post(accountController.createUser);

router
    .route('/:userId')
    .get(accountController.getUser)
    .patch(accountController.updateUser);

module.exports = router;
