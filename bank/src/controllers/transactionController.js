const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('../utils/crypto');
const transactionModel = require('../models/transactionModel');
const accountModel = require('../models/accountModel');

const deposit = catchAsync(async (req, res, next) => {
    const { deposit, password } = req.body;
    const { user } = req;
    const { password: encryptedPassword, accountId } = user;

    // Check validation of password
    if (password && !crypto.verifyPassword(password, encryptedPassword)) {
        return next(new AppError('Wrong password', 401));
    }

    // Create a deposit
    await transactionModel.createDeposit({
        accountId,
        deposit: +deposit,
    });

    res.json({});
});

const payOrder = catchAsync(async (req, res, next) => {
    const { total, username, password } = req.body;

    const account = await accountModel.getByUsername(username);
    if (!account) {
        return next(new AppError('Invalid account', 401));
    }

    const { ACCOUNTID: payerId, ENC_PWD: encryptedPassword } = account;

    // Check validation of password
    if (!crypto.verifyPassword(password, encryptedPassword)) {
        return next(new AppError('Wrong password', 401));
    }

    // Create a payment transaction
    const { returnValue, recordset } =
        await transactionModel.createPaymentTransaction({
            payerId,
            total: +total,
            changedReason: 'Thanh toán cho đơn hàng tại Fabook',
        });

    if (returnValue === -1) {
        return next(new AppError('Not have enough money', 400));
    }

    const { transactionId } = recordset[0];
    res.json({ transactionId });
});

const refund = catchAsync(async (req, res, next) => {
    const { transactionId } = req.body;

    // Create a payment transaction
    const { returnValue } = await transactionModel.createRefundTransaction(
        transactionId
    );

    if (returnValue === -1) {
        return next(new AppError('Non-existed transaction', 400));
    }

    res.status(204).json();
});

const refundOrder = catchAsync(async (req, res, next) => {
    const { total: strTotal, username } = req.body;
    const total = +strTotal;

    const { ACCOUNTID: customerId } = await accountModel.getByUsername(
        username
    );
    if (!customerId) {
        return next(new AppError('Invalid account', 401));
    }

    // Create a payment transaction
    const { returnValue } = await transactionModel.createRefundOrderTransaction(
        customerId,
        total
    );

    res.status(204).json();
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

    res.render('transaction/transactionDetail', {
        title: 'Transaction detail',
        navbar: () => 'navbar',
        ...user,
        ...transaction,
    });
});

module.exports = {
    deposit,
    payOrder,
    refund,
    refundOrder,
    getBalancePage,
    getTransactionPage,
    getTransactionDetailPage,
};
