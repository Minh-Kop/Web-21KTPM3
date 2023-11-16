const express = require('express');

const search = require('../controllers/searchController');

const router = express.Router();

router.get('/count', search.countBooks);
router.get('/', search.getBooks);

module.exports = router;
