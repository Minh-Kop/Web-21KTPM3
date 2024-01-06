const express = require('express');

const shippingAddressController = require('../controllers/shippingAddressController');

const router = express.Router();

router
    .route('/')
    .get(shippingAddressController.getShippingAddresses)
    .post(shippingAddressController.createShippingAddress);

router
    .route('/:addrId')
    .patch(shippingAddressController.updateShippingAddress)
    .delete(shippingAddressController.deleteShippingAddress);

module.exports = router;
