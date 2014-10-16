(function()
{
    window.plusReady(function()
    {
        var url = window.currentWebview.getURL();
        console.color('WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']', 'h1|bgmuted');
    });

    window.on('close', function(e)
    {
        if(window.currentWebview)
        {
            var options = e.detail || {};
            window.currentWebview.close(options.aniClose || 'slide-out-right', options.duration || 150);
        }
    });

    if(document.body.classList.contains('swipeback'))
    {
        window.on('swiperight', function(e)
        {
            window.trigger('closeItem');
        });
    }

    var backBtns = document.$class('action-back');
    if(backBtns.length)
    {
        document.on('tap', '.action-back', function()
        {
            window.trigger('close');
        });
    }
})();
