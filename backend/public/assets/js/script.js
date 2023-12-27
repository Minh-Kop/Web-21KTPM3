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
        return;
    }
    // Check email
    if (
        checkValidation(signUpEmailValue, signUpEmail, emailRegex, 'Email') !==
        1
    ) {
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
    const apiUrl = '/api/users/signup';

    const res = await fetch(apiUrl, requestOptions);
    const result = await res.json();
    console.log(result);

    // If sign up fails
    if (!res.ok) {
        const { message } = result;
        if (message === 'Username already exists.') {
            return Swal.fire({
                title: 'Error',
                text: 'Username đã tồn tại!',
                icon: 'error',
            });
        }
        if (message === 'Email already exists.') {
            return Swal.fire({
                title: 'Error',
                text: 'Email đã tồn tại!',
                icon: 'error',
            });
        }
    }

    Swal.fire({
        title: 'Success',
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
    const apiUrl = '/api/users/login';

    const res = await fetch(apiUrl, requestOptions);

    // If sign up fails
    if (!res.ok) {
        Swal.fire({
            title: 'Error',
            text: 'Username hoặc mật khẩu chưa chính xác!',
            icon: 'error',
            allowOutsideClick: true,
        });
        return;
    }

    const nextUrl = $(e.target).data('nextUrl');
    console.log(nextUrl);
    location.assign(nextUrl);
});
