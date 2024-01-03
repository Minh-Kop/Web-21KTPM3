const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('../utils/crypto');
const transactionModel = require('../models/transactionModel');

const deposit = catchAsync(async (req, res, next) => {
    const { deposit, password } = req.body;
    const { user } = req;
    const { password: encryptedPassword, accountId } = user;

    // Check validation of password
    if (!crypto.verifyPassword(password, encryptedPassword)) {
        return next(new AppError('Wrong password', 401));
    }

    // Create a deposit
    await transactionModel.createDeposit({
        accountId,
        deposit: +deposit,
    });

    res.json({});
});

const getBalancePage = catchAsync(async (req, res, next) => {
    const { user } = req;

    user.balance = user.balance.toLocaleString('vi-VN');

    const transactions = await transactionModel.getTransactions(user.accountId);
    transactions.forEach((el) => {
        let { changedTime, changedMoney, balance } = el;
        el.changedTime = moment(changedTime)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm');
        el.changedMoney = parseInt(changedMoney).toLocaleString('vi-VN');
        el.balance = parseInt(balance).toLocaleString('vi-VN');
    });

    res.render('transaction/balance', {
        title: 'Balance',
        navbar: () => 'navbar',
        ...user,
        transactions,
    });
});

const getTransactionPage = catchAsync(async (req, res, next) => {
    const { user } = req;

    user.balance = user.balance.toLocaleString('vi-VN');

    const transactions = await transactionModel.getTransactions(user.accountId);
    transactions.forEach((el) => {
        let { changedTime, changedMoney } = el;
        el.changedTime = moment(changedTime)
            .subtract(7, 'hours')
            .format('DD/MM/YYYY HH:mm');
        el.changedMoney = parseInt(changedMoney).toLocaleString('vi-VN');
    });

    res.render('transaction/transaction', {
        title: 'Transaction',
        navbar: () => 'navbar',
        ...user,
        transactions,
    });
});

const getTransactionDetailPage = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { accountId } = user;
    const { transactionId } = req.params;

    const transaction = await transactionModel.getTransactionById(
        accountId,
        transactionId
    );
    transaction.changedTime = moment(transaction.changedTime)
        .subtract(7, 'hours')
        .format('HH:mm DD/MM/YYYY');
    transaction.changedMoney = parseInt(
        transaction.changedMoney
    ).toLocaleString('vi-VN');
    console.log(transaction);

    res.render('transaction/transactionDetail', {
        title: 'Transaction detail',
        navbar: () => 'navbar',
        ...user,
        ...transaction,
    });
});

module.exports = {
    deposit,
    getBalancePage,
    getTransactionPage,
    getTransactionDetailPage,
};
