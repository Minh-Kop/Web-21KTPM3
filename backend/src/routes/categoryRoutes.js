const express = require('express');

const categoryController = require('../controllers/categoryController');

const router = express.Router();
router.get('/', categoryController.get);
router.get('/:catId', categoryController.getCategory);

module.exports = router;
