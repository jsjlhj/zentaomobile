(function(window)
{
    var $dialog = document.$('.dialog');

    window.plusReady(function()
    {
        var currentView = plus.webview.currentWebview();
        if(!currentView.dialogOptions) currentView.close('slide-out-right', 200);
    });

    document.addEventListener('tap', function()
    {
        $dialog.classList.remove('show-more-info');
    }, false);

    document.$('.dialog-header').on('tap', function(e)
    {
        $dialog.classList.toggle('show-more-info');

        if(e && e.stopPropagation) e.stopPropagation();
        else window.event.cancelBubble = true;
    }, false);
})(window);
