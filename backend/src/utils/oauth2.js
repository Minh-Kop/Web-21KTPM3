const { OAuth2Client } = require('google-auth-library');
// const { google } = require('googleapis');

const config = require('../config');

// const redirectUri = 'https://developers.google.com/oauthplayground';

const oauth2Client = new OAuth2Client(
    // const oauth2Client = new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    // redirectUri,
);
oauth2Client.setCredentials({
    refresh_token: config.GOOGLE_REFRESH_TOKEN,
});

module.exports = oauth2Client;
