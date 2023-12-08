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
        },
    });
};
