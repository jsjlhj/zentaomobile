(function(window)
{
    var $dialog = document.$('.dialog');

    document.addEventListener('tap', function()
    {
        $dialog.classList.remove('show-more-info');
    }, false);

    document.$('.dialog-header').on('tap', function(e)
    {
        $dialog.classList.toggle('show-more-info');

        e.stopPropagation();
    }, false);
})(window);
