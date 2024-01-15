const renderChild = (fCate) => {
    const cateId = $('#fCategory').find(':selected').val();
    const category = $('#category');
    category.empty();

    for (const i of fCate) {
        if (i.id === cateId) {
            for (j of i.children) {
                $('#category').append(
                    $('<option>', {
                        value: j.id,
                        text: j.categoryName,
                    })
                );
            }
        }
    }
};

$('.image button').on('click', function () {
    this.parentNode.remove();
});

function deleteP() {}

$('#files').on('change', function (event) {
    const files = event.target.files;

    for (const i of files) {
        const url = URL.createObjectURL(i);
        const div = $('<div>', {
            class: 'image',
        });
        const img = $('<img>', {
            src: url,
            alt: i.name,
        });
        const button = $('<button>', {
            type: 'button',
            text: 'X',
        });

        div.append(img, button);

        $('.book-image-display').append(div);
    }

    $('.image button').on('click', function () {
        this.parentNode.remove();
    });
});

$(() => {
    const pub = $('#data-container').attr('data-value1');
    const aut = $('#data-container').attr('data-value2');

    $(`#author option:contains(${aut})`).prop('selected', true);
    $(`#publisher option:contains(${pub})`).prop('selected', true);

    const bookCover = $('#bookCover');
    const bookImages = $('#bookImages');
    let imgTag = bookImages.data('imgTag');
    imgTag = imgTag.split('|');
    const imgCover = imgTag[0];
    imgTag = imgTag.slice(1);

    const setting = {
        theme: 'fa6',
        showUpload: false,
        showCancel: true,
        allowedFileTypes: ['image'],
        maxFileCount: 1,
        previewFileType: 'any',
        fileActionSettings: { showUpload: false },
        initialPreview: imgCover,
        initialPreviewShowDelete: false,
    };

    bookCover.fileinput({
        ...setting,
    });
    bookImages.fileinput({
        ...setting,
        maxFileCount: 10,
        initialPreview: imgTag,
    });
});

$('.btn-submit-create').click(async (e) => {
    e.preventDefault();

    const loadingCircle = $('.waiting');
    loadingCircle.removeClass('d-none');

    const createForm = $('#createForm');
    const formData = new FormData(createForm[0]);
    const { status } = await fetch(`/api/book`, {
        method: 'POST',
        body: formData,
    });
    loadingCircle.addClass('d-none');

    if (status === 200) {
        await Swal.fire({
            title: 'Thành công',
            text: 'Thêm sách thành công!',
            icon: 'success',
        });
        return location.reload();
    }
    await Swal.fire({
        title: 'Lỗi',
        text: 'Thêm sách thất bại!',
        icon: 'error',
    });
});

$('.btn-submit-update').click(async (e) => {
    e.preventDefault();

    const loadingCircle = $('.waiting');
    loadingCircle.removeClass('d-none');

    const updateForm = $('#updateForm');
    const bookId = updateForm.data('bookId');
    const formData = new FormData(updateForm[0]);
    const { error } = await fetch(`/api/book/${bookId}`, {
        method: 'PATCH',
        body: formData,
    }).then((res) => res.json());
    loadingCircle.addClass('d-none');

    await Swal.fire({
        title: 'Thành công',
        text: 'Cập nhật thông tin sách thành công!',
        icon: 'success',
    });

    location.reload();
});
