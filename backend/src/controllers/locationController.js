// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const locationModel = require('../models/locationModel');
const map = require('../utils/map');

exports.getProvinces = catchAsync(async (req, res, next) => {
    const provinces = await locationModel.getProvinces();
    res.status(200).json({
        status: 'success',
        length: provinces.length,
        provinces,
    });
});

exports.getDistricts = catchAsync(async (req, res, next) => {
    const { provId } = req.params;
    const districts = await locationModel.getDistricts(provId);
    res.status(200).json({
        status: 'success',
        length: districts.length,
        districts,
    });
});

exports.getWards = catchAsync(async (req, res, next) => {
    const { distId } = req.params;
    const wards = await locationModel.getWards(distId);
    res.status(200).json({
        status: 'success',
        length: wards.length,
        wards,
    });
});

exports.getCoordinate = catchAsync(async (req, res, next) => {
    const { address, wardId, distId, provId } = req.query;

    const province = await locationModel.getProvinceById(provId);
    const district = await locationModel.getDistrictById(distId);
    const ward = await locationModel.getWardById(wardId);

    const coordinates = await map.getCoordinate(
        address,
        ward.wardName,
        district.distName,
        province.provName,
    );
    res.status(200).json({
        status: 'success',
        coordinates,
    });
});
