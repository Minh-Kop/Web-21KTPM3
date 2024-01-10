const passport = require('passport');

const accountModel = require('../models/accountModel');
const authController = require('../controllers/authController');
const MyStrategy = require('./myStrategy');
const MyGoogleOAuth2Strategy = require('./myGoogleOauth2Strategy');
const crypto = require('./crypto');

passport.serializeUser((user, done) => {
    // console.log('Serialize: ', user);
    const { email } = user;
    done(null, email);
});

passport.deserializeUser(async (email, done) => {
    // console.log('Deserialize: ', email);
    const account = await accountModel.getByEmail(email);
    const returnedAccount = {
        userId: account.USERID,
        username: account.USERNAME,
        email: account.EMAIL,
        fullName: account.FULLNAME,
        phoneNumber: account.PHONE_NUMBER,
        avatarPath: account.AVATAR_PATH,
        role: account.HROLE,
        birthday: account.BIRTHDAY,
        gender: account.GENDER,
        password: account.ENC_PWD,
        isOauth2: account.IS_OAUTH2,
    };
    if (account) {
        return done(null, returnedAccount);
    }
    done('Invalid');
});

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(
        new MyStrategy(async (username, password, done) => {
            try {
                const user = await accountModel.getByUsername(username);

                if (!user) {
                    return done('Invalid authentication', null);
                }

                // Get the database password
                const encryptedPassword = user.ENC_PWD;

                // Check the correctness of password
                if (crypto.verifyPassword(password, encryptedPassword)) {
                    user.email = user.EMAIL;
                    return done(null, user);
                }
                done('Invalid authentication', null);
            } catch (error) {
                done(error);
            }
        }),
    );

    passport.use(
        new MyGoogleOAuth2Strategy(async (info, done) => {
            try {
                const { email } = info;
                const account = await accountModel.getByEmail(email);
                if (!account) {
                    info.username = await authController.signUpForOauth2(email);
                }
                return done(null, info);
            } catch (error) {
                console.log(error);
                done(error);
            }
        }),
    );
};
