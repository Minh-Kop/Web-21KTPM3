// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const locationModel = require('../models/locationModel');
const map = require('../utils/map');
const config = require('../config/config');
const {
    calculateDeliveryDate,
    separateThousandByDot,
} = require('../utils/utils');

const getProvinces = catchAsync(async (req, res, next) => {
    const provinces = await locationModel.getProvinces();
    res.status(200).json({
        status: 'success',
        length: provinces.length,
        provinces,
    });
});

const getDistricts = catchAsync(async (req, res, next) => {
    const { provId } = req.params;
    const districts = await locationModel.getDistricts(provId);
    res.status(200).json({
        status: 'success',
        length: districts.length,
        districts,
    });
});

const getWards = catchAsync(async (req, res, next) => {
    const { distId } = req.params;
    const wards = await locationModel.getWards(distId);
    res.status(200).json({
        status: 'success',
        length: wards.length,
        wards,
    });
});

const getCoordinateUI = async ({ address, wardId, distId, provId }) => {
    const province = await locationModel.getProvinceById(provId);
    const district = await locationModel.getDistrictById(distId);
    const ward = await locationModel.getWardById(wardId);

    const coordinates = await map.getCoordinate(
        address,
        ward.wardName,
        district.distName,
        province.provName,
    );
    return coordinates;
};

const getCoordinate = catchAsync(async (req, res, next) => {
    const { address, wardId, distId, provId } = req.query;

    const coordinates = await getCoordinateUI({
        address,
        wardId,
        distId,
        provId,
    });
    res.status(200).json({
        status: 'success',
        coordinates,
    });
});

const calculateShippingFeeUI = async (coordinates) => {
    let shippingFee = 0;
    let days = 0;
    const distance = await map.getDistance(
        config.SHOP_LAT,
        config.SHOP_LONG,
        coordinates.lat,
        coordinates.lng,
    );

    if (!distance) {
        return null;
    }
    if (distance < 5000) {
        shippingFee = 20000;
        days = 2;
    } else {
        shippingFee = 30000;
        days = 3;
    }
    const deliveryDate = calculateDeliveryDate(days);

    return {
        shippingFee,
        deliveryDate,
    };
};

const calculateShippingFee = catchAsync(async (req, res, next) => {
    const { lat, lng, cartTotal } = req.query;
    const { shippingFee, deliveryDate } = await calculateShippingFeeUI({
        lat,
        lng,
    });
    const finalTotal = +cartTotal + shippingFee;
    res.json({
        finalTotal: separateThousandByDot(finalTotal),
        shippingFee: separateThousandByDot(shippingFee),
        deliveryDate,
    });
});

module.exports = {
    getProvinces,
    getDistricts,
    getWards,
    getCoordinate,
    getCoordinateUI,
    calculateShippingFeeUI,
    calculateShippingFee,
};
