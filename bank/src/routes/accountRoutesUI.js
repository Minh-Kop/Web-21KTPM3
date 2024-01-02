const express = require('express');
const passport = require('passport');

const accountController = require('../controllers/accountController');
// const authController = require('../controllers/authController');
const config = require('../config/config');

const router = express.Router();

router.get('/');

module.exports = router;
