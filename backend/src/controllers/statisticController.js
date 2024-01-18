const moment = require('moment');

// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const statisticModel = require('../models/statisticModel');
const config = require('../config/config');

exports.getStatistic = catchAsync(async (req, res, next) => {
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();

    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const SOrdernRevenue = await statisticModel.getSOrdernRevenue();
    SOrdernRevenue.totalRevenue =
        SOrdernRevenue.totalRevenue == null ? 0 : SOrdernRevenue.totalRevenue;
    const totalRevenueString =
        SOrdernRevenue.totalRevenue.toLocaleString('vi-VN');
    const [totalOrderDaily, totalMonthlyRevenue] =
        await statisticModel.getStatistic();
    totalOrderDaily.forEach((order) => {
        order.orderDate = moment(order.orderDate)
            .subtract(7, 'hours')
            .format('YYYY-MM-DD');
    });
    const JSONtotalOrderDaily = JSON.stringify(totalOrderDaily);
    const JSONtotalMonthlyRevenue = JSON.stringify(totalMonthlyRevenue);

    console.log(user);
    console.log(cart);
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';
    res.render('statistic/statistic', {
        headerName: 'Thống kê',
        title:'Statistic',
        statistic: true,
        status: 'success',
        layout: 'admin',
        navbar: () => 'navbar',
        footer: () => 'empty',
        categoryTree,
        ...user,
        ...cart,
        currentUrl: req.originalUrl,
        isAdmin,
        isLoggedIn,
        totalSuccessfulOrder: SOrdernRevenue.totalSuccessfulOrder,
        totalRevenue: SOrdernRevenue.totalRevenue,
        totalRevenueString,
        JSONtotalOrderDaily,
        JSONtotalMonthlyRevenue,
        totalOrderDaily,
        totalMonthlyRevenue,
    });
});
