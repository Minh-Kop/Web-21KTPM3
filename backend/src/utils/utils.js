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
        if (rootList[i].id === categoryId) {
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

const vietnameseToEnglishMap = {
    à: 'a',
    á: 'a',
    ả: 'a',
    ạ: 'a',
    ã: 'a',
    ă: 'a',
    ắ: 'a',
    ằ: 'a',
    ẳ: 'a',
    ẵ: 'a',
    ặ: 'a',
    â: 'a',
    ấ: 'a',
    ầ: 'a',
    ẩ: 'a',
    ẫ: 'a',
    ậ: 'a',
    đ: 'd',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    ê: 'e',
    ế: 'e',
    ề: 'e',
    ể: 'e',
    ễ: 'e',
    ệ: 'e',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ị: 'i',
    ĩ: 'i',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    ọ: 'o',
    õ: 'o',
    ô: 'o',
    ố: 'o',
    ồ: 'o',
    ổ: 'o',
    ỗ: 'o',
    ộ: 'o',
    ơ: 'o',
    ớ: 'o',
    ờ: 'o',
    ở: 'o',
    ỡ: 'o',
    ợ: 'o',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ụ: 'u',
    ũ: 'u',
    ư: 'u',
    ứ: 'u',
    ừ: 'u',
    ử: 'u',
    ữ: 'u',
    ự: 'u',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỵ: 'y',
    ỹ: 'y',
};

/**
 * Convert Vietnamese string to English string
 *
 * @param {string} input The input string
 */
const convertVietnameseToEnglish = (input) => {
    input = input.toLowerCase();
    return [...input]
        .map((char) => vietnameseToEnglishMap[char] || char)
        .join('');
};

module.exports = {
    buildCategoryRoot,
    searchCategoryTree,
    toListCategory,
    getParentBranch,
    removeUndefined,
    convertVietnameseToEnglish,
};
