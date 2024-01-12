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
        url: '/user/updateMe',
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

$('#changePassword').on('submit', function (event) {
    event.preventDefault();
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success ms-3',
            cancelButton: 'btn btn-danger',
        },
        buttonsStyling: false,
    });
    var formData = $(this).serializeArray();
    let password = {};
    formData.forEach(function (item) {
        password[item.name] = item.value;
    });
    if (password.password !== password.reNewPass) {
        swalWithBootstrapButtons.fire({
            title: 'Mật khẩu không khớp',
            icon: 'error',
        });
    } else {
        $.ajax({
            type: 'PATCH',
            url: '/user/updatePassword',
            data: password,
            success: function (response) {
                let timerInterval;
                swalWithBootstrapButtons
                    .fire({
                        title: 'Đã cập nhật!',
                        text: 'Thay đổi mật khẩu thành công',
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
                    .then(async (result) => {
                        if (result.dismiss === Swal.DismissReason.timer) {
                            await fetch('/logout', {
                                method: 'delete',
                            });
                            window.location.href = '/login';
                        }
                    });
            },
            error: function (error) {
                swalWithBootstrapButtons.fire({
                    title: 'Thay đổi mật khẩu thất bại',
                    icon: 'error',
                });
            },
        });
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

    Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

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
