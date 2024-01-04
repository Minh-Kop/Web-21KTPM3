const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const accountModel = require('./models/accountModel');
const { v4: uuidv4 } = require('uuid');

const config = require('./config/config');

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async function (accessToken, refreshToken, profile, cb) {
            const tokenLogin = uuidv4();
            profile.tokenLogin = tokenLogin;
            const emailAccount = await accountModel.getByEmail(
                profile.emails[0]?.value,
            );
            // if(!emailAccount){
            //     await accountModel.createAccount({
            //         email: profile.emails[0]?.value,
            //         phoneNumber: "",
            //         username: "",
            //         password: "",
            //         verified: 1,
            //         token: profile.tokenLogin,
            //         role: config.role.USER,
            //         // typeLogin: profile?.provider,
            //         //                 name: profile?.displayName,
            //         //                 avatarUrl: profile?.photos[0]?.value,
            //     });
            // }
            console.log(profile);
            return cb(null, profile);
        },
    ),
);

passport.use(
    new FacebookStrategy(
        {
            clientID: config.FACEBOOK_APP_ID,
            clientSecret: config.FACEBOOK_APP_SECRET,
            callbackURL: '/api/auth/facebook/callback',
            profileFields: ['email', 'photos', 'id', 'displayName'],
        },
        async function (accessToken, refreshToken, profile, cb) {
            const tokenLogin = uuidv4();
            profile.tokenLogin = tokenLogin;
            const emailAccount = await accountModel.getByEmail(
                profile.emails[0]?.value,
            );
            // if(!emailAccount){
            //     await accountModel.createAccount({
            //         email: profile.emails[0]?.value,
            //         phoneNumber: "",
            //         username: "",
            //         password: "",
            //         verified: 1,
            //         token: tokenLogin,
            //         role: config.role.USER,
            //         // typeLogin: profile?.provider,
            //         //                 name: profile?.displayName,
            //         //                 avatarUrl: profile?.photos[0]?.value,
            //     });
            // }
            console.log(profile);
            return cb(null, profile);
        },
    ),
);
