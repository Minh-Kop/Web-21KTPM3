const catchAsync = require('../utils/catchAsync');
const shippingAddressControllerUI = require('./shippingAddressControllerUI');
const config = require('../config/config');
const { separateThousandByDot } = require('../utils/utils');
const locationController = require('./locationController');
const locationModel = require('../models/locationModel');

const bankUrl = config.BANK_URL;

const getCheckoutPage = catchAsync(async (req, res, next) => {
    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const { cartTotalNumber, cartBooks } = cart;
    const isLoggedIn = req.isAuthenticated();

    let shippingFee = 0;
    let finalTotal = cartTotalNumber;
    let deliveryDate;
    let hasChosenAnAddr = false;

    const shippingAddresses =
        await shippingAddressControllerUI.getShippingAddresses(user.userId);
    if (shippingAddresses.length) {
        let coordinates;
        shippingAddresses.forEach((el) => {
            const {
                detailedAddress,
                fullName,
                phoneNumber,
                isDefault,
                lat,
                lng,
            } = el;
            el.detailedInfo = `${fullName} | ${detailedAddress} | ${phoneNumber}`;
            el.coordinates = `${lat}|${lng}`;

            if (isDefault) {
                coordinates = {
                    lat,
                    lng,
                };
            }
        });
        const { shippingFee: sf, deliveryDate: dd } =
            await locationController.calculateShippingFeeUI(coordinates);
        shippingFee = sf;
        deliveryDate = dd;
        finalTotal += shippingFee;
        hasChosenAnAddr = true;
    }

    const selectedProducts = cartBooks.filter((el) => el.isClicked);

    const provinces = await locationModel.getProvinces();

    res.render('checkout/checkout', {
        title: 'Checkout',
        navbar: () => 'navbar',
        footer: () => 'empty',
        isLoggedIn,
        ...user,
        ...cart,
        categoryTree,
        currentUrl: req.originalUrl,
        hasChosenAnAddr,
        shippingAddresses,
        selectedProducts,
        shippingFee: separateThousandByDot(shippingFee),
        shippingFeeNumber: shippingFee,
        finalTotal: separateThousandByDot(finalTotal),
        finalTotalNumber: finalTotal,
        deliveryDate,
        cartTotalNumber,
        bankUrl,
        provinces,
    });
});

module.exports = {
    getCheckoutPage,
};
