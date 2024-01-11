const express = require('express');
const passport = require('passport');

const accountController = require('../controllers/accountController');
const authController = require('../controllers/authController');
const config = require('../config/config');
const AppError = require('../utils/appError');

const router = express.Router();

router.post('/signup', authController.signUp);
router.patch('/verify/:token', authController.verify);

router.post('/login', (req, res, next) => {
    passport.authenticate('myStrategy', (err, user, info, status) => {
        // console.log({ err, user, info, status });
        if (err) {
            return next(new AppError(err, 400));
        }
        if (!user) {
            return res.status(401).json();
        }
        req.logIn(user, (logInError) => {
            if (logInError) {
                return next(new AppError(logInError, 500));
            }
            res.status(204).json();
        });
    })(req, res, next);
});
router.get('/login-with-google', (req, res, next) => {
    passport.authenticate(
        'myGoogleOAuth2Strategy',
        (err, user, info, status) => {
            const { state: nextUrl } = req.query;
            let error;
            // console.log({ err, user, info, status });
            if (err) {
                return next(new AppError(err, 400));
            }
            if (info === 'No account is created with this email!') {
                error = 1;
            } else if (
                info ===
                'The account that associates with this email is deleted!'
            ) {
                error = 2;
            }
            if (!user) {
                return res.redirect(`/login?nextUrl=${nextUrl}&error=${error}`);
            }

            req.logIn(user, (logInError) => {
                if (logInError) {
                    return next(new AppError(logInError, 500));
                }
                res.redirect(`${nextUrl}`);
            });
        },
    )(req, res, next);
});

router.get('/logout', authController.logOut);

// Protect all routes after this middleware
router.use(authController.protect);

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
    .patch(accountController.updateUser);

module.exports = router;
