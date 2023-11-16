const express = require('express');

const locationController = require('../controllers/locationController');

const router = express.Router();

router.get('/province', locationController.getProvinces);
router.get('/district/:provId', locationController.getDistricts);
router.get('/ward/:distId', locationController.getWards);
router.get('/coordinate', locationController.getCoordinate);

module.exports = router;
