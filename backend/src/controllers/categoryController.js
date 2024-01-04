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

exports.createCategory = catchAsync(async (req, res, next) => {
    const { fatherCategory, category } = req.query;

    await categoryModel.createCategory({
        cateName: category,
        parentID: fatherCategory,
    });

    res.redirect('/admin/category');
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const { cateId } = req.query;

    await categoryModel.deleteCategory(cateId);

    res.redirect('/admin/category');
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const { fatherCategory, cateId, category } = req.query;

    await categoryModel.updateCategory({
        cateId: cateId,
        cateName: category,
        parentId: fatherCategory,
    });

    res.redirect('/admin/category');
});
