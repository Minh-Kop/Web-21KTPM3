const Handlebars = require('handlebars');

function createCategoryTree(catId, selectedBranch, options) {
    const { isTerminationPoint } = options;
    let html = '';

    selectedBranch = Array.isArray(selectedBranch)
        ? selectedBranch
        : [selectedBranch];

    selectedBranch.forEach((el) => {
        const { isParentOfTerminationPoint } = el;
        let isActive;

        if (isParentOfTerminationPoint) {
            isActive = 'parent-active';
            options.isTerminationPoint = true;
        } else if (catId === el.id) {
            isActive = isTerminationPoint ? 'child-active' : 'active';
        }

        let childHtml = '';
        if (el.children) {
            childHtml = createCategoryTree(catId, el.children, options);
        }

        html += `
            <li class='${isActive}'>
                <a
                    class='category-section__list__link'
                    href='#!'
                >
                    ${el.categoryName}
                </a>
                ${childHtml}
            </li>
        `;
    });

    if (html !== '') {
        html = `<ul class='category-section__list'>${html}</ul>`;
    }
    return html;
}

module.exports = (hbs) => {
    return hbs.create({
        extname: '.hbs',
        helpers: {
            eq(a, b, options) {
                return a === b ? options.fn(this) : options.inverse(this);
            },
            repeat(options) {
                const start = options.hash.start || 1;
                const end = options.hash.end || 1;
                const { page, searchValue } = options.data.root;
                let result = '';

                for (let i = start; i <= end; i++) {
                    result += options.fn({
                        index: i,
                        page,
                        searchValue,
                    });
                }

                return result;
            },
            createCategoryTree,
        },
    });
};
