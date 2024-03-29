const checkValidation = (value, input, regex, message, flag = '') => {
    const formError = input.parent().find('.form-error');
    if (!value) {
        formError.text(`* ${message} chưa được điền`);
        formError.removeClass('d-none');
        return 0;
    }
    if (flag === 're') {
        if (regex !== value) {
            input.addClass('form-input--highlight');
            formError.text(`* ${message} không khớp`);
            formError.removeClass('d-none');
            return -1;
        }
    } else {
        if (!regex.test(value)) {
            input.addClass('form-input--highlight');
            formError.text(`* ${message} chưa hợp lệ`);
            formError.removeClass('d-none');
            return -1;
        }
    }

    formError.addClass('d-none');
    return 1;
};

$('#login').on('click', async (e) => {
    e.preventDefault();
    const username = $('#loginUsername');
    const usernameValue = username.val().trim();
    const password = $('#loginPassword');
    const passwordValue = password.val().trim();

    const nameRegex = /^\w+$/;
    const passwordRegex = /.+/;

    // Check username
    if (checkValidation(usernameValue, username, nameRegex, 'Username') !== 1) {
        return;
    }
    // Check password
    if (
        checkValidation(passwordValue, password, passwordRegex, 'Password') !==
        1
    ) {
        return;
    }

    const body = {
        username: usernameValue,
        password: passwordValue,
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    };
    const apiUrl = '/api/account/login';

    const res = await fetch(apiUrl, requestOptions);

    // If sign up fails
    if (!res.ok) {
        Swal.fire({
            title: 'Lỗi xác thực',
            text: 'Username hoặc mật khẩu chưa chính xác!',
            icon: 'error',
            allowOutsideClick: true,
        });
        return;
    }

    Swal.fire({
        title: 'Thành công',
        text: 'Đăng nhập thành công!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
    }).then(() => {
        const nextUrl = $('.login-page').data('nextUrl');
        location.assign(nextUrl);
    });
});
