const express = require('express');

const transactionController = require('../controllers/transactionController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.post('/deposit', protect, transactionController.deposit);

module.exports = router;
