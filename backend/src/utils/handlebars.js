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

        if (isActive === 'child-active' || isActive === 'active') {
            html += `
                <li class='${isActive}'>
                    <span
                        class='category-section__list__link'
                    >
                        ${el.categoryName}
                    </span>
                    ${childHtml}
                </li>
            `;
        } else {
            html += `
                <li class='${isActive}'>
                    <a
                        class='category-section__list__link'
                        href='/category?catId=${el.id}'
                    >
                        ${el.categoryName}
                    </a>
                    ${childHtml}
                </li>
            `;
        }
    });

    if (html !== '') {
        html = `<ul data-id='${catId}' class='category-section__list'>${html}</ul>`;
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
            index(index) {
                return index + 1;
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
            orderState(obj) {
                if (obj == 0) return 'Đơn hàng mới';
                else if (obj == 1) return 'Đang xử lý';
                else if (obj == -1) return 'Bị hủy';
                else if (obj == 2) return 'Đang giao hàng';
                else if (obj == 3) return 'Thành công';
                else if (obj == 6) return 'Tất cả';
            },
            state(obj) {
                if (obj == -1)
                    return new Handlebars.SafeString(
                        `<span class='badge rounded-pill text-bg-danger'>Đơn hàng bị hủy</span>`,
                    );
                if (obj == 3)
                    return new Handlebars.SafeString(
                        `<span class='badge rounded-pill text-bg-success'>Đơn hàng thành công</span>`,
                    );
                if (obj == 0)
                    return new Handlebars.SafeString(
                        `<span class='badge rounded-pill text-bg-primary'>Đơn hàng mới</span>`,
                    );
                if (obj == 1)
                    return new Handlebars.SafeString(
                        `<span class='badge rounded-pill text-bg-primary'>Đơn hàng đang xử lý</span>`,
                    );
                if (obj == 2)
                    return new Handlebars.SafeString(
                        `<span class='badge rounded-pill text-bg-primary'>Đơn hàng đang giao</span>`,
                    );
            },
            getOrderStateInfo(obj, int) {
                if (int == 1) {
                    return new Handlebars.SafeString(
                        `<p>Đơn hàng mới</p><p>${
                            obj[obj.length - 1].createdTime
                        }</p>`,
                    );
                }
                if (int == 3) {
                    if (obj[0].orderState == -1) {
                        return new Handlebars.SafeString(
                            `<p>Bị hủy</p><p>${obj[0].createdTime}</p>`,
                        );
                    }
                    if (obj[0].orderState == 3) {
                        return new Handlebars.SafeString(
                            `<p>Thành công</p><p>${obj[0].createdTime}</p>`,
                        );
                    }
                    return new Handlebars.SafeString(` `);
                }
                if (obj.length < 2) {
                    return new Handlebars.SafeString(
                        `<p>Đang xử lý</p><p>${obj[0].createdTime}</p>`,
                    );
                }
                return new Handlebars.SafeString(
                    `<p>Đang xử lý</p><p>${obj[1].createdTime}</p>`,
                );
            },
            checkState(obj, str, int) {
                if (obj == 3) {
                    if (str == 'color')
                        return new Handlebars.SafeString('#29a72a');
                    if (str == 'link') {
                        if (int == 1)
                            return new Handlebars.SafeString(
                                'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_donhangmoi_green.svg',
                            );
                        if (int == 2) {
                            return new Handlebars.SafeString(
                                'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_dangxuly_green.svg',
                            );
                        }
                        if (int == 3) {
                            return new Handlebars.SafeString(
                                'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_hoantat_green.svg',
                            );
                        }
                    }
                }
                if (obj == -1) {
                    if (str == 'color')
                        return new Handlebars.SafeString('#fa0001');
                    else if (str == 'link') {
                        if (int == 1)
                            return new Handlebars.SafeString(
                                'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_donhangmoi_red.svg',
                            );
                        else if (int == 2) {
                            return new Handlebars.SafeString(
                                'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_dangxuly_red.svg',
                            );
                        } else if (int == 3) {
                            return new Handlebars.SafeString(
                                'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_huy_red.svg',
                            );
                        }
                    }
                }
                if (str == 'color') return new Handlebars.SafeString('#0078d4');
                else if (str == 'link') {
                    if (int == 1)
                        return new Handlebars.SafeString(
                            'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_donhangmoi_blue.svg',
                        );
                    else if (int == 2) {
                        return new Handlebars.SafeString(
                            'https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/order/ico_dangxuly_blue.svg',
                        );
                    } else if (int == 3) {
                        return new Handlebars.SafeString('');
                    }
                }
            },
            add(a, b) {
                return new Handlebars.SafeString(
                    (a + b).toLocaleString('vi-VN'),
                );
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
                                <a href="/book/${item.bookId}">
                                <img src="${item.image}" class="img-fluid" alt="book_image">
                                </a>
                                <a class="fs-6" href="/book/${item.bookId}" style="text-decoration: none; color: black">${item.bookName}</a>
                                <p class="fs-6 text-danger fw-bold mb-1">${item.originalPriceString} VNĐ</p>
                                <p class="fs-6 text-muted text-decoration-line-through mb-1">${item.discountedPriceString} VNĐ</p>
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
            getRole(a) {
                if (a == 1) return 'Khách hàng'
                return 'Admin'
            },
            createCategoryTree,
        },
    });
};
