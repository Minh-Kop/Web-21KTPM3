const passport = require('passport');
const { Strategy } = require('passport-strategy');
const { google } = require('googleapis');

const config = require('../config/config');

module.exports = class MyGoogleOAuth2Strategy extends Strategy {
    constructor(verify, options) {
        super();
        this.name = 'myGoogleOAuth2Strategy';
        this.verify = verify;
        this.clientID = config.GOOGLE_CLIENT_ID;
        this.clientSecret = config.GOOGLE_CLIENT_SECRET;
        this.authorizationURL = 'https://accounts.google.com/o/oauth2/v2/auth';
        this.tokenURL = 'https://oauth2.googleapis.com/token';
        this.scope = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];
        passport.strategies[this.name] = this; // Register the strategy with Passport;
    }

    async authenticate(req, options) {
        const redirectURI = `${req.protocol}://${req.get(
            'host',
        )}/api/user/login-with-google`;
        const oauth2Client = new google.auth.OAuth2(
            this.clientID,
            this.clientSecret,
            redirectURI,
        );

        const { nextUrl, code } = req.query;

        if (!code) {
            // Generate a url that asks permissions for the Drive activity scope
            const authorizationUrl = oauth2Client.generateAuthUrl({
                // 'online' (default) or 'offline' (gets refresh_token)
                access_type: 'offline',
                /** Pass in the scopes array defined above.
                 * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
                scope: this.scope.join(' '),
                // Enable incremental authorization. Recommended as a best practice.
                include_granted_scopes: true,
                state: nextUrl,
            });
            return this.redirect(authorizationUrl);
        }

        // Get access and refresh tokens (if access_type is offline)
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const { data } = await google
            .oauth2('v2')
            .userinfo.get({ auth: oauth2Client });

        this.verify(data, (err, user) => {
            if (err) {
                return this.fail(err);
            }
            if (!user) {
                return this.fail('Invalid user');
            }
            this.success(user);
        });
    }
};
