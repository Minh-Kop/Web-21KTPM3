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
                    accum.push(currentNode);
                    if (currentNode.children) {
                        stack.push(currentNode.children);
                    }
                }
                for (let i = 0; i < accum.length - 1; i++) {
                    html += `<li class='breadcrumb-item'><a href='/category/${accum[i].id}' style="text-decoration: none; color: rgba(33, 37, 41, 0.75)">${accum[i].categoryName}</a></li>`;
                }
                html += `<li class='breadcrumb-item active' aria-current='page'>
                    ${accum[accum.length - 1].categoryName}
                </li>`;
                return new Handlebars.SafeString(html);
            },
            mainImage(obj) {
                return obj[0].path;
            },
            carousel(obj) {
                const chunks = [];
                const chunkSize = 4;

                for (book of obj) {
                    let accum = '';
                    for (let i = 0; i < book.avgRating; ++i) {
                        accum += "<i class='fa fa-star'></i>";
                    }
                    for (let i = 0; i < 5 - book.avgRating; ++i) {
                        accum += "<i class='fa-regular fa-star'></i>";
                    }
                    book.stars = accum;
                }
                for (let i = 0; i < obj.length; i += chunkSize) {
                    chunks.push(obj.slice(i, i + chunkSize));
                }

                const related = chunks
                    .map(
                        (chunk, pageIndex) =>
                            `<div class="carousel-item ${
                                pageIndex === 0 ? 'active' : ''
                            }"><div class="row">${chunk
                                .map(
                                    (item) =>
                                        `<div class="col-3">
                                <a href="/books/${item.bookId}">
                                <img src="${item.image}" class="img-fluid" alt="book_image">
                                </a>
                                <a class="fs-6" href="/books/${item.bookId}" style="text-decoration: none; color: black">${item.bookName}</a>
                                <p class="fs-6 text-danger fw-bold mb-1">${item.originalPrice} VND</p>
                                <p class="fs-6 text-muted text-decoration-line-through mb-1">${item.discountedPrice} VND</p>
                                <div class='d-flex flex-row my-3'>
                                    <div class='text-warning'>
                                        ${item.stars}
                                    </div>
                                    <span class='text text-warning'>(${item.countRating})</span>
                                </div>
                            </div>`,
                                )
                                .join('')}</div></div>`,
                    )
                    .join('');

                return new Handlebars.SafeString(`<div id="related" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                ${related}
            </div>
        </div>`);
            },
            createCategoryTree,
        },
    });
};
