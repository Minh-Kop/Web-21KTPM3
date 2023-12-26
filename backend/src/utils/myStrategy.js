const passport = require('passport');
const { Strategy } = require('passport-strategy');

module.exports = class MyStrategy extends Strategy {
    constructor(verify, options) {
        super();
        this.name = 'myStrategy'; // Set a name for your strategy
        this.verify = verify; // Set the verify function for authentication
        // Any additional options or configuration can be handled here
        this.username =
            options && options.username ? options.username : 'username';
        this.password =
            options && options.password ? options.password : 'password';
        passport.strategies[this.name] = this; // Register the strategy with Passport;
    }

    authenticate(req, options) {
        // Implement the authentication logic here
        // Call this.success(user, info) if authentication is successful
        // Call this.fail(info) if authentication fails
        const username = req.body[this.username];
        const password = req.body[this.password];
        this.verify(username, password, (err, user) => {
            if (err) {
                return this.fail(err);
            }
            if (user) {
                return this.success(user, null);
            }
            this.fail('Invalid authentication');
        });
    }
};
