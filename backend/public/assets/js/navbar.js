// Show/hide dropdown
$('.nav__category').on('mouseenter', () => {
    $('.category-menu-dropdown__padding').removeClass('d-none');
});

$('.nav__category, .category-menu-dropdown__padding').on('mouseleave', (e) => {
    if (
        !$(e.relatedTarget).closest('.category-menu-dropdown__padding').length
    ) {
        $('.category-menu-dropdown__padding').addClass('d-none');
    }
});

// Change category detail
$('.category-menu-dropdown__category').on('mouseenter', (e) => {
    const selectedCatId = $(e.target).data('cat-id');
    const curDetail = $('.category-menu-dropdown__detail:not(.d-none)');
    const selectedDetail = $(
        `.category-menu-dropdown__detail[data-cat-id="${selectedCatId}"]`
    );
    if (curDetail.data('cat-id') === selectedCatId) {
        return;
    }
    curDetail.addClass('d-none');
    selectedDetail.removeClass('d-none');
});

// Log out
$('#logout').click(async (e) => {
    e.preventDefault();
    await fetch('/api/user/logout', {
        method: 'delete',
    });
    location.reload();
});

// Search button
$('.nav__search-btn').click((e) => {
    e.preventDefault();
    const keyword = $('.nav__search-input').val();
    location.assign(`/search?keyword=${keyword}`);
});
