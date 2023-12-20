const categoryModel = require('../models/categoryModel');
const publisherModel = require('../models/publisherModel');
const bookController = require('../controllers/bookControllerUI');
const { buildCategoryRoot, getCategoryBranch } = require('../utils/utils');
const { priceRanges } = require('../config/config');
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

const stringtifyBranch = (branch, catId) => {
    if (Array.isArray(branch)) {
        for (let i = 0; i < branch.length; i++) {
            const { id, categoryName } = branch[i];
            if (id === catId) {
                return { catId: id, categoryName };
            }
        }
        return null;
    }

    const { id, categoryName, children } = branch;
    const arr = [{ catId: id, categoryName }];

    if (id === catId) {
        return arr.flat();
    }

    if (children) {
        const childrenBranch = stringtifyBranch(children, catId);
        if (childrenBranch) {
            arr.push(childrenBranch);
        }
    }
    return arr.flat();
};

const getCategoryPage = catchAsync(async (req, res, next) => {
    const { catId, page, priceRange, pubId } = req.query;

    const category = await categoryModel.getAllCategory();
    const categoryTree = buildCategoryRoot(category);
    const selectedBranch = getCategoryBranch(categoryTree, catId);
    const publisher = await publisherModel.getAll();
    const books = await bookController.getAllBooks({
        categoryId: catId,
        page,
        priceRange,
    });

    const stringtifiedBranch = stringtifyBranch(selectedBranch, catId);

    res.render('category/categoryPage', {
        title: 'Category page',
        categories: categoryTree,
        stringtifiedBranch,
        catId,
        selectedBranch,
        publisher,
        chosenPubId: pubId || 'all',
        priceRanges,
        priceRange: priceRange || 'all',
        books,
        page,
        totalPages: 55,
    });
});

module.exports = {
    getCategoryPage,
};
