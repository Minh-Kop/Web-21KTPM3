const express = require('express');

const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.get('/', transactionController.getTransactionPage);
router.get('/balance', transactionController.getBalancePage);
router.get('/:transactionId', transactionController.getTransactionDetailPage);

module.exports = router;
