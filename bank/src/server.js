const fs = require('fs');
const https = require('https');
const path = require('path');

const config = require('./config/config');

const port = config.PORT || 3001;
const opts = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), {
        encoding: 'utf-8',
    }),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), {
        encoding: 'utf-8',
    }),
};

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

const server = https.createServer(opts, app);

server.listen(port, async () => {
    console.log(`App is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLER REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
