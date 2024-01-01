// Change shipping address
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

// Submit button
$('.confirm-checkout-btn').click(async () => {
    $('.waiting').removeClass('d-none');

    const body = {
        addrId: $('input[name="addrId"]:checked').prop('id'),
        shippingFee: $('.checkout-total__shipping').data('shippingFee'),
    };
    console.log(body);

    const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    console.log(res.status);

    $('.waiting').addClass('d-none');
});
