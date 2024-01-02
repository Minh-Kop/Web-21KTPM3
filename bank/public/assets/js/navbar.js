// Log out
$('#logout').click(async (e) => {
    e.preventDefault();
    await fetch('/logout', {
        method: 'delete',
    });
    location.reload();
});
