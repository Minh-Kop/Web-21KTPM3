// ==================================== Change shipping address ====================================
$('input[name="addrId"]').change(async (e) => {
    $('.waiting').removeClass('d-none');

    const target = $(e.target);
    const [lat, lng] = target.val().split('|');
    const cartTotal = target.closest('ul').data('cartTotal');

    // Call API
    const { shippingFee, deliveryDate, finalTotal } = await fetch(
        `/api/location/shipping-fee?lat=${lat}&lng=${lng}&cartTotal=${cartTotal}`
    ).then((res) => res.json());

    // Update data
    $('.checkout-total__final-total__amount').text(`${finalTotal} VNĐ`);
    $('.shipping-info__date').text(deliveryDate);
    $('.checkout-total__shipping__amount').text(`${shippingFee} VNĐ`);
    $('.shipping-info__fee').text(shippingFee);

    // Activate submit button
    $('.confirm-checkout-btn').addClass('active').prop('disabled', false);

    $('.waiting').addClass('d-none');
});

// ==================================== Submit button ====================================
$('.confirm-checkout-btn').click(async () => {
    const { value: password } = await Swal.fire({
        title: 'Xác thực thanh toán',
        input: 'password',
        inputLabel: 'Nhập mật khẩu xác thực',
        inputPlaceholder: 'Mật khẩu',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off',
        },
    });
    if (!password) {
        return;
    }

    $('.waiting').removeClass('d-none');

    // Create transaction
    let returnedResult = await createTransaction(password);
    if (returnedResult === -1) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Mật khẩu xác thực không chính xác!',
            icon: 'error',
        });
    }
    if (returnedResult === -2) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Tiền trong tài khoản không đủ để thanh toán!',
            icon: 'error',
        });
    }

    // Create order
    const body = {
        addrId: $('input[name="addrId"]:checked').prop('id'),
        shippingFee: $('.checkout-total__shipping').data('shippingFee'),
    };
    const { status } = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (status === 404) {
        $('.waiting').addClass('d-none');
        return Swal.fire({
            title: 'Error',
            text: 'Trong đơn hàng của bạn, có sản phẩm không còn tồn tại trong kho hoặc vượt quá số lượng trong kho!',
            icon: 'error',
        }).then(async () => {
            location.assign('/cart');
        });
    }

    $('.waiting').addClass('d-none');
    Swal.fire({
        title: 'Success',
        text: 'Đặt hàng thành công!',
        icon: 'success',
    }).then(async () => {
        location.assign('/category');
    });
});

const createTransaction = async (password) => {
    const element = $('.bottom-sidebar-content');
    const body = {
        total: element.data('finalTotal'),
        username: element.data('username'),
        password,
    };
    const bankUrl = element.data('bankUrl');
    console.log(body, bankUrl);

    const { status } = await fetch(`${bankUrl}/api/transaction/pay-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (status === 401) {
        return -1;
    }
    if (status === 400) {
        return -2;
    }
    return 1;
};

/* ==================================== Add address ==================================== */
$('.add-addr-btn').click((e) => {
    e.preventDefault();
    $('.popup-section').removeClass('d-none');
});

$('.background-behind, .address-popup__btn--close').click((e) => {
    e.preventDefault();
    $('.popup-section').addClass('d-none');
});

// Check validation
const checkValidation = (value, input, regex, message, flag = '') => {
    const formError = input.parent().find('.form-error');
    let isNull = false;
    let error = '';

    if (!value) {
        isNull = true;
        error = `* ${message} đang bị trống`;
    }
    if (!isNull) {
        if (regex.test(value)) {
            input.removeClass('address-popup__line__input-error');
            formError.addClass('d-none');
            return 1;
        }

        switch (flag) {
            case 'name':
                error = '* Họ và tên phải có ít nhất 2 từ';
                break;
            case 'phone':
                error = `* ${message} không hợp lệ`;
                break;
            case 'addr':
                error = `* ${message} không hợp lệ`;
                break;
        }
    }

    input.addClass('address-popup__line__input-error');
    formError.text(error).removeClass('d-none');
    return -1;
};

$('.address-popup__btn--submit').click(async (e) => {
    e.preventDefault();

    const fullNameEl = $('#addrFullName');
    const fullName = fullNameEl.val().trim();
    const phoneNumberEl = $('#addrPhoneNumber');
    const phoneNumber = phoneNumberEl.val().trim();
    const provinceEl = $('#addrProvince');
    const province = provinceEl.val();
    const addressEl = $('#address');
    const address = addressEl.val().trim();

    const nameRegex = /\S+\s+\S+/;
    const phoneNumberRegex = /^0\d{9}$/;
    const addressRegex = /.*/;

    console.log({ province });

    // Check full name
    if (
        checkValidation(
            fullName,
            fullNameEl,
            nameRegex,
            'Họ và tên',
            'name'
        ) !== 1
    ) {
        return;
    }
    // Check phone number
    if (
        checkValidation(
            phoneNumber,
            phoneNumberEl,
            phoneNumberRegex,
            'Số điện thoại',
            'phone'
        ) !== 1
    ) {
        return;
    }
    // Check province
    if (
        checkValidation(
            province,
            provinceEl,
            addressRegex,
            'Tỉnh/thành phố',
            'addr'
        ) !== 1
    ) {
        return;
    }
    // Check address
    if (
        checkValidation(address, addressEl, addressRegex, 'Địa chỉ', 'addr') !==
        1
    ) {
        return;
    }

    //     const res = await fetch('/api/transaction/deposit', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             deposit,
    //             password,
    //         }),
    //     });
    //     const { status } = res;
    //
    //     if (status === 401) {
    //         return Swal.fire({
    //             title: 'Error',
    //             text: 'Mật khẩu không chính xác!',
    //             icon: 'error',
    //             allowOutsideClick: true,
    //         });
    //     }
    //
    //     await Swal.fire({
    //         title: 'Success',
    //         text: 'Nạp tiền thành công!',
    //         icon: 'success',
    //         timer: 2000,
    //         timerProgressBar: true,
    //         showConfirmButton: false,
    //     });
    //     location.reload();
});
