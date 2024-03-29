const express = require('express');

const search = require('../controllers/searchController');

const router = express.Router();

router.get('/', search.getBooksAPI);
router.get('/count', search.countBooksAPI);

module.exports = router;
