const passport = require('passport');

const MyStrategy = require('./myStrategy');
const accountModel = require('../models/accountModel');
const crypto = require('./crypto');

passport.serializeUser((user, done) => {
    // console.log('Serialize: ', user);
    done(null, user.Username);
});

passport.deserializeUser(async (username, done) => {
    // console.log('Deserialize: ', username);
    // const account = await accountModels.getAccountByUsername(username);
    const account = await accountModel.getByUsername(username);
    if (account) {
        return done(null, account);
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

                // Get the database password
                const encryptedPassword = user.ENC_PWD;

                // Check the correctness of password
                if (crypto.verifyPassword(password, encryptedPassword)) {
                    console.log('Verify');
                    return done(null, user);
                }
                console.log('Fail');
                done('Invalid authentication', null);
            } catch (error) {
                done(error);
            }
        }),
    );
};
