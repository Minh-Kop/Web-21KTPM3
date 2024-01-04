const moment = require('moment');

/**
 * Build the category tree from the category list
 *
 * @param {Category[]} categoryList A list of category with parentId
 * @param {int} parentId The id of parent category node (default `null`)
 * @returns {TreeCategory[]} An array of trie, each tree is a branch of category
 */
const buildCategoryRoot = (categoryList, parentId = null) => {
    const root = categoryList.filter((item) => item.PARENT_ID === parentId);
    if (root.length === 0) {
        return undefined;
    }
    const other = categoryList.filter((item) => item.PARENT_ID !== parentId);
    for (let i = 0; i < root.length; i++) {
        const children = buildCategoryRoot(other, root[i].CATE_ID);
        if (children) {
            root[i].children = children;
        }
    }
    const result = root.map((item) => ({
        id: item.CATE_ID,
        categoryName: item.CATE_NAME,
        description: item.CATE_DESC,
        children: item.children,
    }));
    return result;
};

/**
 * Search for a node in the list of Category Tree
 *
 * @param {TreeCategory[]} rootList An array of category trie
 * @param {string} categoryName The name of category need to find
 * @returns {TreeCategory} The searching node
 */
const searchCategoryTree = (rootList, categoryId) => {
    if (rootList === null || rootList === undefined) {
        return null;
    }
    for (let i = 0; i < rootList.length; i++) {
        if (rootList[i].id === categoryId) {
            return rootList[i];
        }
        if (rootList[i].children) {
            const result = searchCategoryTree(rootList[i].children, categoryId);
            if (result) {
                return result;
            }
        }
    }
    return null;
};

/**
 * Reshape the category tree to an array
 *
 * @param {TreeCategory} root A node of category tree
 * @returns {Category[]} The category list after reshape
 */
// const toListCategory = (root) => {
//     if (!root) {
//         return null;
//     }

//     const { children, ...rest } = root;
//     let result = [rest];
//     if (children) {
//         for (let i = 0; i < children.length; i++) {
//             const childList = toListCategory(children[i]);
//             result = result.concat(childList);
//         }
//     }
//     return result;
// };
const toListCategory = (root) => {
    if (!root) {
        return null;
    }

    const { children, ...rest } = root;
    let result = [];
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const childList = toListCategory(children[i]);
            result = result.concat(childList);
        }
    } else {
        result = result.concat(rest);
    }
    return result;
};

/**
 *
 * @param {*} rootList
 * @param {*} categoryId
 * @returns
 */
const getParentBranch = (rootList, categoryId) => {
    if (!rootList) {
        return null;
    }

    for (let i = 0; i < rootList.length; i++) {
        const { children, ...rest } = rootList[i];
        if (rest.id === categoryId) {
            return rest;
        }
        if (children) {
            const result = getParentBranch(children, categoryId);
            if (result) {
                return {
                    ...rest,
                    children: result,
                };
            }
        }
    }
    return null;
};

/**
 *
 * @param {*} rootList
 * @param {*} categoryId
 * @returns
 */
const getCategoryBranch = (rootList, categoryId) => {
    if (!rootList) {
        return null;
    }

    for (let i = 0; i < rootList.length; i++) {
        const { children, ...rest } = rootList[i];
        if (rest.id === categoryId) {
            if (children) {
                const otherChildren = children.map((el) => {
                    // eslint-disable-next-line no-unused-vars
                    const { children: nextChildren, ...otherInfos } = el;
                    return otherInfos;
                });
                return {
                    ...rest,
                    children: otherChildren,
                };
            }
            return { ...rest, isTerminationPoint: true };
        }
        if (children) {
            const result = getCategoryBranch(children, categoryId);
            if (result) {
                const { isTerminationPoint } = result;

                if (isTerminationPoint) {
                    const otherChildren = children.map((el) => {
                        // eslint-disable-next-line no-unused-vars
                        const { children: nextChildren, ...otherInfos } = el;
                        return otherInfos;
                    });
                    return {
                        isParentOfTerminationPoint: true,
                        ...rest,
                        children: otherChildren,
                    };
                }

                return {
                    ...rest,
                    children: result,
                };
            }
        }
    }
    return null;
};

const removeUndefined = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] === Object(obj[key])) {
            newObj[key] = removeUndefined(obj[key]);
        } else if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

const separateThousandByDot = (number) => {
    if (number === 0) {
        return '0';
    }

    const numArr = [];
    while (number) {
        const remainder = number % 1000;
        numArr.push(remainder.toString());
        number = parseInt(number / 1000, 10);
    }
    return numArr.reduce((str, curNum, index) => {
        curNum =
            index === numArr.length - 1
                ? curNum
                : '0'.repeat(3 - curNum.length) + curNum;
        str = !index ? `${curNum}` : `${curNum}.${str}`;
        return str;
    }, '');
};

const calculateDeliveryDate = (days) => {
    const currentDate = moment();
    const futureDate = currentDate.add(days, 'days');

    let dayOfWeek = futureDate.format('dddd');
    switch (dayOfWeek) {
        case 'Sunday':
            dayOfWeek = 'Chủ nhật';
            break;
        case 'Monday':
            dayOfWeek = 'Thứ hai';
            break;
        case 'Tuesday':
            dayOfWeek = 'Thứ ba';
            break;
        case 'Wednesday':
            dayOfWeek = 'Thứ tư';
            break;
        case 'Thursday':
            dayOfWeek = 'Thứ năm';
            break;
        case 'Friday':
            dayOfWeek = 'Thứ sáu';
            break;
        default:
            dayOfWeek = 'Thứ bảy';
            break;
    }

    return `${dayOfWeek} - ${futureDate.format('DD/MM')}`;
};

module.exports = {
    buildCategoryRoot,
    searchCategoryTree,
    toListCategory,
    getParentBranch,
    getCategoryBranch,
    removeUndefined,
    separateThousandByDot,
    calculateDeliveryDate,
};
