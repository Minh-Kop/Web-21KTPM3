const express = require('express');

const accountController = require('../controllers/accountController');
const router = express.Router();

router.get('/', accountController.getHomePage);
router.get('/deposit', accountController.getDepositPage);

module.exports = router;
