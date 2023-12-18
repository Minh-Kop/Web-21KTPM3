const categoryModel = require('../models/categoryModel');
const { buildCategoryRoot } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');

exports.get = catchAsync(async (req, res, next) => {
    const result = await categoryModel.getAllCategory();
    const categories = buildCategoryRoot(result);
    res.status(200).json({
        status: 'success',
        categories,
    });
});

const getCategoryPage = catchAsync(async (req, res, next) => {
    const result = await categoryModel.getAllCategory();
    const categories = buildCategoryRoot(result);
    res.render('category/categoryPage', {
        title: 'Category page',
        navbar: () => 'navbar',
        categories,
        footer: () => 'footer',
        totalPages: 55,
        page: 10,
        link: '',
    });
});

module.exports = {
    getCategoryPage,
};
