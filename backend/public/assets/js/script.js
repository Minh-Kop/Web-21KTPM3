$(async () => {
    const error = $('.login-page').data('error');
    if (!error) {
        return;
    }

    let text = '';
    if (error === 1) {
        text =
            'Email bạn chọn chưa được liên kết với tài khoản nào trong hệ thống!';
    } else if (error === 2) {
        text = 'Tài khoản liên kết với email này trong hệ thống đã bị xóa!';
    }
    return Swal.fire({
        title: 'Lỗi xác thực',
        text,
        icon: 'error',
    });
});

/* ==================================== Validate ==================================== */
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

$('#sign-up').on('click', async (e) => {
    e.preventDefault();
    $('.waiting').removeClass('d-none');

    const username = $('#signUpUsername');
    const usernameValue = username.val().trim();
    const signUpEmail = $('#signUpEmail');
    const signUpEmailValue = signUpEmail.val().trim();
    const signUpPassword = $('#signUpPassword');
    const signUpPasswordValue = signUpPassword.val().trim();
    const rePassword = $('#rePassword');
    const rePasswordValue = rePassword.val().trim();

    const nameRegex = /^\w+$/;
    const emailRegex =
        /^[A-Za-z0-9._%+-]{2,31}\@([A-Za-z]{2,31}\.)+[A-Za-z]{2,31}$/;
    // const emailRegex = /.+/;
    const passwordRegex = /.+/;

    // Check username
    if (checkValidation(usernameValue, username, nameRegex, 'Username') !== 1) {
        $('.waiting').addClass('d-none');
        return;
    }
    // Check email
    if (
        checkValidation(signUpEmailValue, signUpEmail, emailRegex, 'Email') !==
        1
    ) {
        $('.waiting').addClass('d-none');
        return;
    }
    // Check password
    if (
        checkValidation(
            signUpPasswordValue,
            signUpPassword,
            passwordRegex,
            'Password'
        ) !== 1
    ) {
        $('.waiting').addClass('d-none');
        return;
    }
    // Check re-enter password
    if (
        checkValidation(
            rePasswordValue,
            rePassword,
            signUpPasswordValue,
            'Password nhập lại',
            're'
        ) !== 1
    ) {
        $('.waiting').addClass('d-none');
        return;
    }

    const body = {
        username: usernameValue,
        email: signUpEmailValue,
        password: signUpPasswordValue,
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    };
    const apiUrl = '/api/user/signup';

    const res = await fetch(apiUrl, requestOptions);
    const result = await res.json();

    // If sign up fails
    if (!res.ok) {
        const { message } = result;
        if (message === 'Username already exists.') {
            $('.waiting').addClass('d-none');
            return Swal.fire({
                title: 'Lỗi',
                text: 'Username đã tồn tại!',
                icon: 'error',
            });
        }
        if (message === 'Email already exists.') {
            $('.waiting').addClass('d-none');
            return Swal.fire({
                title: 'Lỗi',
                text: 'Email đã tồn tại!',
                icon: 'error',
            });
        }
    }

    $('.waiting').addClass('d-none');
    Swal.fire({
        title: 'Thành công',
        text: 'Tạo tài khoản thành công!',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
    }).then(() => {
        location.assign(`/login`);
    });
});

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

    const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: usernameValue,
            password: passwordValue,
        }),
    });

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

    const nextUrl = $('.login-page').data('nextUrl');
    location.assign(nextUrl);
});

/* ==================================== Other login ==================================== */
$('#google').click(async (e) => {
    e.preventDefault();
    const nextUrl = $('.login-page').data('nextUrl');
    location.assign(`/api/user/login-with-google?nextUrl=${nextUrl}`);
});

$('#facebook').click((e) => {
    e.preventDefault();
});
