// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const config = require('../config/config');

const getCheckoutPage = catchAsync(async (req, res, next) => {
    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();

    res.render('checkout/checkout', {
        title: 'Checkout',
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        ...cart,
        categoryTree,
        currentUrl: req.originalUrl,
    });
});

module.exports = {
    getCheckoutPage,
};
