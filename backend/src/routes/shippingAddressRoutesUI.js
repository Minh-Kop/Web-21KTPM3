const express = require('express');

const shippingAddressController = require('../controllers/shippingAddressControllerUI');

const router = express.Router();

router
    .route('/')
    .get(shippingAddressController.getMyShippingAddresses)
    .post(shippingAddressController.createShippingAddress);

router
    .route('/:addrId')
    .patch(shippingAddressController.updateShippingAddress)
    .delete(shippingAddressController.deleteShippingAddress);

module.exports = router;
