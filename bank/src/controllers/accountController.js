const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const transactionModel = require('../models/transactionModel');

const createAccount = catchAsync(async (req, res, next) => {
    const { password, username, isOauth2 } = req.body;

    // Check for username duplicated
    const account = await accountModel.getByUsername(username);
    if (account) {
        return next(new AppError('Username already exists.', 400));
    }

    // Create entity to insert to DB
    await accountModel.createAccount({
        username,
        password,
        isOauth2,
    });

    res.status(200).json({
        status: 'success',
        message: 'Create bank account successfully',
    });
});

const updatePassword = catchAsync(async (req, res, next) => {
    const { password, username } = req.body;

    // Check for username duplicated
    const account = await accountModel.getByUsername(username);
    if (!account) {
        return next(new AppError('Invalid account', 401));
    }

    const { ACCOUNTID: accountId } = account;
    await accountModel.updatePassword({
        accountId,
        password,
    });

    res.status(204).json();
});

const getHomePage = catchAsync(async (req, res, next) => {
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

    res.render('account/home', {
        title: 'Home',
        navbar: () => 'navbar',
        ...user,
        transactions: transactions.slice(0, 3),
    });
});

const getDepositPage = catchAsync(async (req, res, next) => {
    const { user } = req;

    res.render('account/deposit', {
        title: 'Deposit',
        navbar: () => 'navbar',
        ...user,
        balance: user.balance.toLocaleString('vi-VN'),
    });
});

module.exports = { createAccount, updatePassword, getHomePage, getDepositPage };
