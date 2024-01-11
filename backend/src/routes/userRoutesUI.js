const express = require('express');
const passport = require('passport');

const accountController = require('../controllers/accountControllerUI');
const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

router.post('/signup', authController.signUp);
router.patch('/verify/:token', authController.verify);
// router.post('/login', authController.login);
router.post('/login', passport.authenticate('myStrategy'), (req, res, next) => {
    res.status(204).json();
});
router.get('/logout', authController.logOut);

// Protect all routes after this middleware
router.use(authController.protectPage);

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', accountController.getMe, accountController.getMyAccount);
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
    .patch(accountController.updateUser)
    .delete(accountController.deleteUser);

module.exports = router;
