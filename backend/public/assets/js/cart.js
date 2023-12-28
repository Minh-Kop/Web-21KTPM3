$('input[name="checkboxAll"]').on('change', async function () {
    $('.waiting').removeClass('d-none');

    const isChecked = $(this).prop('checked');
    const isClicked = isChecked ? 1 : 0;

    await fetch('/api/cart/all', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            isClicked,
        }),
    });
    const { cart } = await fetch('/api/cart').then((res) => res.json());
    const { cartCount, cartTotal, cartBooks } = cart;
    let isAllClicked = false;
    if (cartBooks.length) {
        isAllClicked = cartBooks.every((el) => {
            return el.isClicked === true;
        });
    }

    renderCartInNavbar({ cartCount, cartBooks });
    renderCartList({ isAllClicked, cartCount, cartBooks });
    renderCartTotal(cartTotal);

    $('.waiting').addClass('d-none');
});

const renderCartTotal = (cartTotal) => {
    $('.total-cart__amount').text(`${cartTotal} VNĐ`);
    $('.final-total__amount').text(`${cartTotal} VNĐ`);

    $('.cart-checkout__btn')
        .toggleClass('active')
        .prop('disabled', cartTotal === '0');
};

const renderCartList = ({ isAllClicked, cartCount, cartBooks }) => {
    $('.cart-mini-quantity').text(`(${cartCount} sản phẩm)`);
    $('#checkboxAll').prop('checked', isAllClicked);
    $('#chooseAll').text(`Chọn tất cả (${cartCount} sản phẩm)`);

    let html = '';
    cartBooks.forEach((book) => {
        const {
            bookId,
            bookName,
            originalPrice,
            discountedPrice,
            cartPrice,
            quantity,
            isClicked,
            image,
        } = book;
        html += `
            <li class='cart-item'>
                <div class='radio-btn'>
                    <input
                        class='d-none'
                        type='checkbox'
                        name='itemCheckbox'
                        id='${bookId}'
                        value='${bookId}'
                        ${isClicked ? 'checked' : ''}
                    />
                    <label for='${bookId}'></label>
                </div>

                <div class='cart-item__info'>
                    <a href='/books/${bookId}'>
                        <img
                            class='cart-item__img'
                            src='${image}'
                            alt=''
                        />
                    </a>
                    <div class='cart-item__desc'>
                        <h2 class='cart-item__title'>
                            <a
                                class='line-clamb'
                                href='/books/${bookId}'
                            >
                                ${bookName}
                            </a>
                        </h2>
                        <div class='cart-item__price'>
                            <span class='cart-item__price--discounted'>
                                ${discountedPrice} VNĐ
                            </span>
                            <span class='cart-item__price--original'>
                                ${originalPrice} VNĐ
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <div class='quantity-box'>
                        <button class='quantity-box__btn'>
                            <svg
                                class='quantity-box__btn__img'
                                xmlns='http://www.w3.org/2000/svg'
                                height='16'
                                width='14'
                                viewBox='0 0 448 512'
                            >
                                <path
                                    fill='currentColor'
                                    d='M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z'
                                />
                            </svg>
                        </button>
                        <span
                            class='quantity-box__quantity'
                        >
                            ${quantity}
                        </span>
                        <button class='quantity-box__btn'>
                            <svg
                                class='quantity-box__btn__img'
                                xmlns='http://www.w3.org/2000/svg'
                                height='16'
                                width='14'
                                viewBox='0 0 448 512'
                            >
                                <path
                                    fill='currentColor'
                                    d='M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z'
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <span class='cart-item__price--cart'>
                    ${cartPrice}
                    VNĐ
                </span>

                <div class='d-flex justify-content-center'>
                    <button class='delete-btn'>
                        <svg
                            class='delete-btn__icon'
                            xmlns='http://www.w3.org/2000/svg'
                            height='16'
                            width='14'
                            viewBox='0 0 448 512'
                        >
                            <path
                                fill='currentColor'
                                d='M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z'
                            />
                        </svg>
                    </button>
                </div>
            </li>
            <div class='product-border'></div>
        `;
    });
    $('ul.cart-list').html(html);
};

const renderCartInNavbar = ({ cartCount, cartBooks }) => {
    $('.nav__cart__dropdown__heading').text(`Giỏ hàng (${cartCount})`);

    let html = '';
    cartBooks.forEach((book) => {
        const {
            bookId,
            bookName,
            originalPrice,
            discountedPrice,
            cartPrice,
            quantity,
            isClicked,
            image,
        } = book;
        html += `
            <li class="nav__cart__dropdown__book-item">
                <a class="nav__cart__dropdown__book-link" href="/books/${bookId}">
                    <img class="thumb" src="${image}" alt="">
                    <div class="info">
                        <h2 class="heading line-clamb">${bookName}</h2>
                        <div class="d-flex align-items-center">
                            <span class="price">${discountedPrice} VNĐ</span> 
                            
                            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512"><path opacity="1" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                            <span>${quantity}</span>
                        </div>
                    </div>
                </a>
            </li>
        `;
    });
    $('.nav__cart__dropdown__book-list').html(html);

    const cartMini = $('.cart-mini__quantity');
    if (!cartCount) {
        cartMini.addClass('d-none');
    } else {
        cartMini.removeClass('d-none');
        cartMini.text(cartCount);
    }
};
