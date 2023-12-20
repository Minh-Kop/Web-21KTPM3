// const cron = require('node-cron');

const config = require('./config/config');
// const tierModel = require('./models/tierModel');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

const port = config.PORT || 3001;
const server = app.listen(port, async () => {
    console.log(`App is running on port ${port}...`);
});

// Automatically run at a certain time
// const cronOptions = {
//     timezone: 'Asia/Ho_Chi_Minh',
// };
// cron.schedule(
//     '4 0 1 1 *',
//     async () => {
//         await tierModel.updateTier();
//     },
//     cronOptions,
// );
// cron.schedule(
//     '6 0 * * *',
//     async () => {
//         await tierModel.giveBirthdayGift();
//     },
//     cronOptions,
// );

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLER REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully!');
    server.close(() => {
        console.log('Process terminated!');
    });
});
