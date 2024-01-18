const express = require('express');

const {
    renderReadBooks,
    renderCreateBook,
    renderUpdateBook,
    renderCategoryPage,
    renderUpdateCategory,
    renderCreateCategory,
    deleteBook,
} = require('../controllers/adminController');
const {
    createCategory,
    deleteCategory,
    updateCategory,
} = require('../controllers/categoryController');
const { getStatistic } = require('../controllers/statisticController');
const {
    getCreateUserPage,
    getAllUsers,
    getUser,
} = require('../controllers/accountControllerUI');
const orderControllerUI = require('../controllers/orderControllerUI');

const router = express.Router();

router.get('/book', renderReadBooks);
router.get('/book/createBookUI', renderCreateBook);
router.get('/book/updateBookUI', renderUpdateBook);
router.get('/book/delete', deleteBook);

router.get('/order');

router.get('/category', renderCategoryPage);
router.get('/category/createCategoryUI', renderCreateCategory);
router.get('/category/updateCategoryUI', renderUpdateCategory);
router.get('/category/create', createCategory);
router.get('/category/update', updateCategory);
router.get('/category/delete', deleteCategory);

router.get('/statistic', getStatistic);

router.get('/user/createUser', getCreateUserPage);
router.get('/user/', getAllUsers);
router.get('/user/:userId', getUser);

router.get('/order', orderControllerUI.getAllOrders);
router.get('/order/:orderId', orderControllerUI.getDetailOrderForAdmin);

module.exports = router;
