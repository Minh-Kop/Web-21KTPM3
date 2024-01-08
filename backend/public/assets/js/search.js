/* ==================================== Radio button ==================================== */
$('.custom-radio input').click((e) => {
    $('.glory-circle').addClass('d-none');
    $(e.target).parent().find('.glory-circle').removeClass('d-none');
});

$('body').click((e) => {
    const target = $(e.target);
    if (target.closest('.custom-radio').length) {
        return;
    }
    $('.glory-circle').addClass('d-none');
});

/* ==================================== Input ==================================== */
$(
    "input[name='priceRadios'], input[name='pubRadios'], select[name='sortAttr'], select[name='limit']"
).on('change', () => {
    const keyword = $('.nav__search-input').val();
    const selectedPrice = $("input[name='priceRadios']:checked").val();
    const selectedPublisher = $("input[name='pubRadios']:checked").val();
    const sortAttr = $("select[name='sortAttr']").val();
    const limit = $("select[name='limit']").val();
    const link = `/search?keyword=${keyword}&priceRange=${selectedPrice}&pubId=${selectedPublisher}&sortType=${sortAttr}&limit=${limit}`;
    window.location = link;
});
