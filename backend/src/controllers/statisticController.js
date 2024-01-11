const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const statisticModel = require('../models/statisticModel');

exports.getStatistic = catchAsync(async (req, res, next) => {
    const { user } = req;

    const SOrdernRevenue = await statisticModel.getSOrdernRevenue();
    console.log(SOrdernRevenue)
    SOrdernRevenue.totalRevenue =
        SOrdernRevenue.totalRevenue == null ? 0 : SOrdernRevenue.totalRevenue;
    const totalRevenueString =
        SOrdernRevenue.totalRevenue.toLocaleString('vi-VN');

    res.render('statistic/statistic', {
        title: 'Thống kê',
        status: 'success',
        navbar: () => 'empty',
        footer: () => 'empty',
        ...user,
        totalSuccessfulOrder: SOrdernRevenue.totalSuccessfulOrder,
        totalRevenue: SOrdernRevenue.totalRevenue,
        totalRevenueString,
    });
});
