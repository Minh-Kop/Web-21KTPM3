const categoryModel = require('../models/categoryModel');
const publisherModel = require('../models/publisherModel');
const bookController = require('./bookControllerUI');
const { buildCategoryRoot, getCategoryBranch } = require('../utils/utils');
const { priceRanges, sortList, limitList } = require('../config/config');
const catchAsync = require('../utils/catchAsync');

const getCategoryTree = async () => {
    const result = await categoryModel.getAllCategory();
    const categories = buildCategoryRoot(result);
    return categories;
};

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
    const {
        catId: chosenCatId,
        page: chosenPage,
        priceRange,
        pubId,
        sortType: chosenSortType,
        limit: chosenLimit,
    } = req.query;
    const catId = chosenCatId || 'CA16';
    const page = +chosenPage || 1;
    const limit = +chosenLimit || 24;
    const sortType = chosenSortType || 'book_discounted_price';
    const entity = {
        categoryId: catId,
        priceRange: priceRange === 'all' ? null : priceRange,
        publisherId: pubId === 'all' ? null : pubId,
        sortType,
    };

    const { user } = req;
    const isLoggedIn = req.isAuthenticated();

    const { categoryTree } = req;
    const selectedBranch = getCategoryBranch(categoryTree, catId);
    const publisher = await publisherModel.getAll();

    const books = await bookController.getAllBooks({
        ...entity,
        page,
        limit,
    });

    const totalNumber = await bookController.countBooks(entity);
    const totalPages = Math.ceil(parseFloat(totalNumber) / limit);

    // Get URL
    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    const stringtifiedBranch = stringtifyBranch(selectedBranch, catId);

    res.render('category/categoryPage', {
        title: 'Category page',
        categoryTree,
        stringtifiedBranch,
        catId,
        selectedBranch,
        publisher,
        chosenPubId: pubId || 'all',
        priceRanges,
        priceRange: priceRange || 'all',
        sortList,
        sortType,
        limitList,
        books,
        limit,
        page,
        totalPages,
        link: newUrl,
        navbar: () => 'navbar',
        footer: () => 'footer',
        isLoggedIn,
        ...user,
        currentUrl: url,
    });
});

module.exports = {
    getCategoryTree,
    getCategoryPage,
};
