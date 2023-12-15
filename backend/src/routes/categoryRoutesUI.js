const express = require('express');

const categoryController = require('../controllers/categoryControllerUI');

const router = express.Router();
router.get('/', categoryController.getCategoryPage);

module.exports = router;
