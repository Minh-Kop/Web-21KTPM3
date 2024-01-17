const updateOrderState = async (orderId, orderState) => {
    const res = await fetch(`/api/order/${orderId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderState }),
    });
    return res;
};

$('.order-item__button-section').click(async (e) => {
    const target = $(e.target);
    const orderId = target
        .closest('.order-item')
        .find('.order-item__info a')
        .text();
    let orderState, res;

    const loadingCircle = $('.waiting');
    loadingCircle.removeClass('d-none');

    if (target.closest('.order-item__button--accept').length) {
        orderState = 2;
        res = await updateOrderState(orderId, orderState);
    } else if (target.closest('.order-item__button--cancel').length) {
        orderState = -1;
        res = await updateOrderState(orderId, orderState);
    } else {
        return loadingCircle.addClass('d-none');
    }

    loadingCircle.addClass('d-none');

    const result = await res.json();
    console.log(result);
    if (res.ok) {
        await Swal.fire({
            title: 'Thành công',
            text: 'Cập nhật trạng thái đơn hàng thành công!',
            icon: 'success',
        });
        return location.assign(`/admin/order?orderState=${orderState}`);
    }
    return await Swal.fire({
        title: 'Lỗi',
        text: 'Cập nhật trạng thái đơn hàng thất bại!',
        icon: 'error',
    });
});
