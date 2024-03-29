const categoryModel = require('../models/categoryModel');
const publisherModel = require('../models/publisherModel');
const bookController = require('./bookControllerUI');
const { buildCategoryRoot, getCategoryBranch } = require('../utils/utils');
const { priceRanges, sortList, limitList } = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const getCategoryTree = async () => {
    const result = await categoryModel.getAllCategory();
    const categories = buildCategoryRoot(result);
    return categories;
};

const stringifyBranch = (branch, catId) => {
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
        const childrenBranch = stringifyBranch(children, catId);
        if (childrenBranch) {
            arr.push(childrenBranch);
        }
    }
    return arr.flat();
};

const getCategoryPage = catchAsync(async (req, res, next) => {
    const {
        catId,
        page: chosenPage,
        priceRange,
        pubId,
        sortType: chosenSortType,
        limit: chosenLimit,
    } = req.query;

    // Redirect if doesn't have catId
    if (!catId) {
        return res.redirect('/category?catId=CA16');
    }

    // Information from pre-middleware
    const { user, cart, categoryTree } = req;
    const isLoggedIn = req.isAuthenticated();
    let isAdmin = false;
    if (isLoggedIn) {
        isAdmin = user.role === config.role.ADMIN;
    }

    // Parameters to get books
    const page = +chosenPage || 1;
    const limit = +chosenLimit || 24;
    const sortType = chosenSortType || 'book_discounted_price';
    const entity = {
        categoryId: catId,
        priceRange: priceRange === 'all' ? null : priceRange,
        publisherId: pubId === 'all' ? null : pubId,
        sortType,
    };

    // Create category branch
    const selectedBranch = getCategoryBranch(categoryTree, catId);
    const stringifiedBranch = stringifyBranch(selectedBranch, catId);

    const publisher = await publisherModel.getAll();
    publisher.unshift({
        pubId: 'all',
        pubName: 'Tất cả',
    });

    const books = await bookController.getAllBooks({
        ...entity,
        page,
        limit,
    });

    // Pagination
    const totalNumber = await bookController.countBooks(entity);
    const totalPages = Math.ceil(parseFloat(totalNumber) / limit);
    // Get URL
    const url = req.originalUrl;
    const indexOfPage = url.lastIndexOf('&page');
    const newUrl = indexOfPage !== -1 ? url.substring(0, indexOfPage) : url;

    res.render('category/categoryPage', {
        title: 'Category page',
        navbar: () => 'navbar',
        footer: () => 'footer',
        categoryTree,
        stringifiedBranch,
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
        isLoggedIn,
        ...user,
        ...cart,
        currentUrl: url,
        isAdmin,
    });
});

module.exports = {
    getCategoryTree,
    getCategoryPage,
};
