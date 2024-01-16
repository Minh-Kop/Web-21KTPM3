const moment = require('moment');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const accountModel = require('../models/accountModel');
const config = require('../config/config');

exports.getMyAccount = catchAsync(async (req, res, next) => {
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const detailedUser = await accountModel.getDetailedUser(user.userId);
    const avatarTag = `<img src="${user.avatarPath}" class="kv-preview-data file-preview-image">`;

    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }
    detailedUser.recordset[0].birthday = moment(
        detailedUser.recordset[0].birthday,
    )
        .subtract(7, 'hours')
        .format('YYYY-MM-DD');

    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    res.render('account/user_account', {
        title: detailedUser.recordset[0].userName,
        user: detailedUser.recordset[0],
        link: newUrl,
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: url,
        categoryTree,
        avatarTag,
        isAdmin,
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { user } = req;

    const detailedUser = await accountModel.getDetailedUser(userId);
    const avatarTag = `<img src="${user.avatarPath}" class="kv-preview-data file-preview-image">`;
    // Check if this user exists
    if (detailedUser.returnValue === -1) {
        return next(new AppError('The account is no longer exist.', 404));
    }

    detailedUser.recordset[0].birthday = moment(
        detailedUser.recordset[0].birthday,
    )
        .subtract(7, 'hours')
        .format('YYYY-MM-DD');
    res.render('account/crud_user_detail', {
        title: 'Chi tiết tài khoản',
        navbar: () => 'empty',
        footer: () => 'empty',
        status: 'success',
        user: detailedUser.recordset[0],
        ...user,
        avatarTag
    });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const { page: chosenPage, limit: chosenLimit } = req.query;
    const { user, cart, categoryTree } = req;

    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    const page = +chosenPage || 1;
    const limit = +chosenLimit || 4;

    const tempUsers = await accountModel.getAllUsers({
        page,
        limit,
    });
    const totalNumber = await accountModel.countUser();
    console.log(totalNumber);
    const totalPages = Math.ceil(parseFloat(totalNumber) / limit);

    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('?page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    const users = tempUsers.map((el) => ({
        ...el,
        birthday: moment(el.birthday).subtract(7, 'hours').format('DD/MM/YYYY'),
        avatarPath: el.avatarPath || '/assets/img/account_icon.svg',
    }));
    user.avatarPath = user.avatarPath || '/assets/img/account_icon.svg';
    res.render('account/crud_users_list', {
        headerName: 'Danh sách tài khoản',
        layout: 'admin',
        status: 'success',
        navbar: () => 'navbar',
        footer: () => 'empty',
        page,
        totalPages,
        link: newUrl,
        categoryTree,
        ...user,
        ...cart,
        isLoggedIn,
        isAdmin,
        currentUrl: url,
        users,
    });
});

exports.getCreateUserPage = catchAsync(async (req, res, next) => {
    res.render('account/crud_add_user', {
        title: 'Thêm user',
        navbar: () => 'empty',
        footer: () => 'empty',
    });
});
