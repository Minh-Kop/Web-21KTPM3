$('li:not(.active):not(.child-active) > .category-section__list__link').click(
    (e) => {
        e.preventDefault();
        let link = $(e.target).attr('href');
        const selectedPrice = $("input[name='priceRadios']:checked").val();
        const selectedPublisher = $("input[name='pubRadios']:checked").val();
        link = `${link}&priceRange=${selectedPrice}&pubId=${selectedPublisher}`;
        window.location = link;
    }
);

$(
    "input[name='priceRadios'], input[name='pubRadios'], select[name='sortAttr'], select[name='limit']"
).on('change', () => {
    const catId = $('.category-section__list').data('id');
    const selectedPrice = $("input[name='priceRadios']:checked").val();
    const selectedPublisher = $("input[name='pubRadios']:checked").val();
    const sortAttr = $("select[name='sortAttr']").val();
    const limit = $("select[name='limit']").val();
    const link = `/category?catId=${catId}&priceRange=${selectedPrice}&pubId=${selectedPublisher}&sortType=${sortAttr}&limit=${limit}`;
    window.location = link;
});
