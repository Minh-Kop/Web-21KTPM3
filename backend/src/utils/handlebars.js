const Handlebars = require('handlebars');

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
            rating(n) {
                let accum = '';
                for (let i = 0; i < n; ++i) {
                    accum += "<i class='fa fa-star'></i>";
                }
                for (let i = 0; i < 5 - n; ++i) {
                    accum += "<i class='fa-regular fa-star'></i>";
                }
                return new Handlebars.SafeString(accum);
            },
            breadcrumb(obj) {
                let accum = [];
                let html = '';
                const stack = [obj];
                while (stack.length > 0) {
                    const currentNode = stack.pop();
                    accum.push(currentNode.categoryName);
                    if (currentNode.children) {
                        stack.push(currentNode.children);
                    }
                }
                for (let i = 0; i < accum.length - 1; i++) {
                    html += `<li class='breadcrumb-item'><a href='#'>${accum[i]}</a></li>`;
                }
                html += `<li class='breadcrumb-item active' aria-current='page'>
                    ${accum[accum.length - 1]}
                </li>`;
                return new Handlebars.SafeString(html);
            },
            mainImage(obj) {
                return(obj[0].path);
            }
        },
    });
};
