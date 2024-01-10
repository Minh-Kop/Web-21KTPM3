const checkValidation = (value, input, regex, message, flag = '') => {
    const formError = input.parent().find('.form-error');
    if (!value) {
        formError.text(`* ${message} chưa được điền`);
        formError.removeClass('d-none');
        return 0;
    }
    if (regex.test(value)) {
        formError.addClass('d-none');
        return 1;
    }

    let error = '';
    switch (flag) {
        case 'd':
            error = '* Chỉ được điền vào các ký tự là số';
            break;
        case 'p':
            error = '* Mật khẩu chưa hợp lệ';
            break;
    }
    input.addClass('form-input--highlight');
    formError.text(error);
    formError.removeClass('d-none');
    return -1;
};

$('.submit-btn').click(async (e) => {
    e.preventDefault();

    const depositEl = $('#depositNum');
    const deposit = depositEl.val().trim();
    const passwordEl = $('#password');
    const password = passwordEl.val().trim();
    const isOauth2 = passwordEl.data('isOauth2');

    const numberRegex = /^\d+$/;
    const passwordRegex = /.+/;

    // Check deposit
    if (
        checkValidation(
            deposit,
            depositEl,
            numberRegex,
            'Số tiền muốn nạp',
            'd'
        ) !== 1
    ) {
        return;
    }
    // Check password
    if (
        !isOauth2 &&
        checkValidation(
            password,
            passwordEl,
            passwordRegex,
            'Password',
            'p'
        ) !== 1
    ) {
        return;
    }

    const res = await fetch('/api/transaction/deposit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            deposit,
            password,
        }),
    });
    const { status } = res;

    if (status === 401) {
        return Swal.fire({
            title: 'Error',
            text: 'Mật khẩu không chính xác!',
            icon: 'error',
            allowOutsideClick: true,
        });
    }

    await Swal.fire({
        title: 'Success',
        text: 'Nạp tiền thành công!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
    });
    location.reload();
});
