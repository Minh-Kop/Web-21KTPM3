const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const statisticModel = require('../models/statisticModel');

exports.getStatistic = catchAsync(async (req, res, next) => {
    const { user } = req;

    const SOrdernRevenue = await statisticModel.getSOrdernRevenue();
    SOrdernRevenue.totalRevenue =
        SOrdernRevenue.totalRevenue == null ? 0 : SOrdernRevenue.totalRevenue;
    const totalRevenueString =
        SOrdernRevenue.totalRevenue.toLocaleString('vi-VN');
    const [
        totalOrderDaily,
        totalMonthlyRevenue
    ] = await statisticModel.getStatistic();
    // totalOrderDaily.forEach(order => {
    //     order.orderDate = moment(order.orderDate)
    //         .subtract(7, 'hours')
    //         .format('YYYY-MM-DD');
    // });
    console.log(totalOrderDaily, totalMonthlyRevenue)
    res.render('statistic/statistic', {
        headerName: 'Thống kê',
        status: 'success',
        layout: 'admin',
        navbar: () => 'navbar',
        footer: () => 'empty',
        ...user,
        totalSuccessfulOrder: SOrdernRevenue.totalSuccessfulOrder,
        totalRevenue: SOrdernRevenue.totalRevenue,
        totalRevenueString,
        totalOrderDaily,
        totalMonthlyRevenue,
    });
});
