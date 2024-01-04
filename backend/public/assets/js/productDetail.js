$('.small-image').on('click', function () {
    var newSrc = $(this).attr('src');
    $('#mainImage').attr('src', newSrc);
});

$('#numberInput').focusout(function () {
    if (isNaN(parseInt($('#numberInput').val()))) {
        $('#numberInput').val('0');
    }
});

// Quantity button
$('#incrementBtn').on('click', function () {
    var val = $('#numberInput').val();
    $('#numberInput').val(parseInt(val) + 1);
});

$('#decrementBtn').on('click', function () {
    var val = parseInt($('#numberInput').val());
    val = val - 1 < 0 ? 0 : val - 1;
    $('#numberInput').val(val);
});

$('.rating-btn').on('click', function () {
    $('.rating-btn').removeClass('btn-outline-warning');
    $('.rating-btn').addClass('btn-outline-dark');
    $(this).removeClass('btn-outline-dark').addClass('btn-outline-warning');
});

// Add cart button
$('.add-cart').on('click', async () => {
    const book = {
        bookId: $('#bookId').text(),
        quantity: $('#numberInput').val(),
    };

    const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });

    if (res.status === 401) {
        const currentUrl = window.location.pathname;
        return location.assign(`/login?nextUrl=${currentUrl}`);
    }
    if (res.status === 400) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Số lượng bạn muốn mua đã vượt quá số lượng trong kho!',
            icon: 'error',
        });
    }
    if (res.status === 404) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Sản phẩm bạn muốn mua không còn tồn tại trong kho!',
            icon: 'error',
        }).then(() => {
            location.assign('/');
        });
    }
    return Swal.fire({
        title: 'Success',
        text: 'Đã thêm sản phẩm vào giỏ hàng!',
        icon: 'success',
    }).then(async () => {
        await renderCartInNavbar();
    });
});

// Buy now button
$('.buy-now').on('click', async () => {
    const book = {
        bookId: $('#bookId').text(),
        quantity: $('#numberInput').val(),
        isClicked: 1,
    };

    const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
    });

    if (res.status === 401) {
        const currentUrl = window.location.pathname;
        return location.assign(`/login?nextUrl=${currentUrl}`);
    }
    if (res.status === 400) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Số lượng bạn muốn mua đã vượt quá số lượng trong kho!',
            icon: 'error',
        });
    }
    if (res.status === 404) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Sản phẩm bạn muốn mua không còn tồn tại trong kho!',
            icon: 'error',
        }).then(() => {
            location.assign('/');
        });
    }
    return location.assign(`/cart`);
});

const renderCartInNavbar = async () => {
    const { cart } = await fetch('/api/cart').then((res) => res.json());
    const { cartCount, cartBooks } = cart;
    let html = '';

    $('.nav__cart__dropdown__heading').text(`Giỏ hàng (${cartCount})`);
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
                <a class="nav__cart__dropdown__book-link" href="/book/${bookId}">
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
