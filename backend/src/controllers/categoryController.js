const categoryModel = require('../models/categoryModel');
const { buildCategoryRoot, getCategoryBranch } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');

exports.get = catchAsync(async (req, res, next) => {
    const result = await categoryModel.getAllCategory();
    const categories = buildCategoryRoot(result);
    res.status(200).json({
        status: 'success',
        categories,
    });
});

exports.getCategory = catchAsync(async (req, res, next) => {
    const { catId } = req.params;

    const category = await categoryModel.getAllCategory();
    const categoryTree = buildCategoryRoot(category);
    const selectedBranch = getCategoryBranch(categoryTree, catId);

    res.status(200).json({
        status: 'success',
        branch: selectedBranch,
    });
});
