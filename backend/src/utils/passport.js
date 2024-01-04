const passport = require('passport');

const MyStrategy = require('./myStrategy');
const accountModel = require('../models/accountModel');
const crypto = require('./crypto');

passport.serializeUser((user, done) => {
    // console.log('Serialize: ', user);
    done(null, user.USERNAME);
});

passport.deserializeUser(async (username, done) => {
    // console.log('Deserialize: ', username);
    const account = await accountModel.getByUsername(username);
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
                    return done(null, user);
                }
                done('Invalid authentication', null);
            } catch (error) {
                done(error);
            }
        }),
    );
};
