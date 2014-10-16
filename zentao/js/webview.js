(function()
{
    window.plusReady(function()
    {
        var url = window.currentWebview.getURL();
        console.color('WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']', 'h1|bgmuted');
    });

    if(document.body.classList.contains('swipeback'))
    {
        window.on('swiperight', function(e)
        {
            if(window.currentWebview)
            {
                window.currentWebview.close('slide-out-right', 150);
            }
        });
    }

    var backBtns = document.$class('action-back');
    if(backBtns.length)
    {
        document.on('tap', '.action-back', function()
        {
            window.currentWebview.close('slide-out-right', 150);
        });
    }
})();
