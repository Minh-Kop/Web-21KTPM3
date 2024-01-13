const createLoadingPopup = () => {
    return Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

$('#updateForm').on('submit', function (event) {
    event.preventDefault();
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success ms-3',
            cancelButton: 'btn btn-danger',
        },
        buttonsStyling: false,
    });
    var formData = $(this).serializeArray();
    let user = {};
    formData.forEach(function (item) {
        user[item.name] = item.value;
    });

    $.ajax({
        type: 'PATCH',
        url: '/api/user/updateMe',
        data: user,
        success: function (response) {
            let timerInterval;
            swalWithBootstrapButtons
                .fire({
                    title: 'Đã cập nhật!',
                    text: 'Thay đổi thông tin thành công',
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector('b');
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft()}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    },
                })
                .then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        location.reload();
                    }
                });
        },
        error: function (error) {
            swalWithBootstrapButtons.fire({
                title: 'Cập nhật thất bại',
                icon: 'error',
            });
        },
    });
});

$('#changePassword').on('submit', async function (event) {
    event.preventDefault();

    const formData = $(this).serializeArray();
    let password = {};
    formData.forEach(function (item) {
        password[item.name] = item.value;
    });
    if (password.password !== password.reNewPass) {
        return Swal.fire({
            title: 'Lỗi',
            text: 'Mật khẩu nhập lại không khớp!',
            icon: 'error',
            allowOutsideClick: true,
        });
    }

    createLoadingPopup();

    const { status } = await fetch('/api/user/updatePassword', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(password),
    });

    if (status === 204) {
        await Swal.fire({
            title: 'Thành công',
            text: 'Thay đổi password thành công!',
            icon: 'success',
            allowOutsideClick: true,
        });
        return location.reload();
    }
    if (status === 401) {
        await Swal.fire({
            title: 'Lỗi',
            text: 'Password cũ không chính xác!',
            icon: 'error',
            allowOutsideClick: true,
        });
        return;
    }
    if (status === 500) {
        await Swal.fire({
            title: 'Lỗi',
            text: 'Đổi password thất bại!',
            icon: 'error',
            allowOutsideClick: true,
        });
        return;
    }
});

const avatarTag = $('.main-content').data('avatarTag');
$('#formFile').fileinput({
    theme: 'fa6',
    showUpload: false,
    previewFileType: 'any',
    allowedFileTypes: ['image'],
    maxFileCount: 1,
    previewFileType: 'any',
    fileActionSettings: { showUpload: false },
    initialPreview: avatarTag,
    initialPreviewShowDelete: false,
});

$('#uploadAvatar').on('submit', async function (event) {
    event.preventDefault();

    createLoadingPopup();

    const formData = new FormData(this);

    const { status } = await fetch('/api/user/avatar', {
        method: 'PATCH',
        body: formData,
    });

    if (status === 204) {
        await Swal.fire({
            title: 'Thành công',
            text: 'Thay đổi avatar thành công!',
            icon: 'success',
            allowOutsideClick: true,
        });
        return location.reload();
    }
    if (status === 400) {
        return Swal.fire({
            title: 'Lỗi',
            text: 'Không có hình ảnh nào được gửi đi!',
            icon: 'error',
            allowOutsideClick: true,
        });
    }
    return Swal.fire({
        title: 'Thất bại',
        text: 'Thay đổi avatar không thành công!',
        icon: 'error',
        allowOutsideClick: true,
    });
});
