const express = require('express');
const passport = require('passport');

const accountController = require('../controllers/accountController');

const router = express.Router();

router.post('/create-account', accountController.createAccount);
router.post('/login', passport.authenticate('myStrategy'), (req, res, next) => {
    res.status(204).json();
});
router.get(
    '/login-with-google',
    passport.authenticate('myGoogleOAuth2Strategy'),
    (req, res, next) => {
        const { state: nextUrl } = req.query;
        res.redirect(`${nextUrl}`);
    }
);
router.patch('/password', accountController.updatePassword);

module.exports = router;
