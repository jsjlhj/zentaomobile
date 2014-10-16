(function()
{
    window.plusReady(function()
    {
        var url = window.currentWebview.getURL();
        console.color('WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']', 'h1|bgmuted');

        var closeWindow = function(e)
        {
            if(window.currentWebview)
            {
                var options = e.detail || e || {};
                window.currentWebview.close(options.aniClose || 'slide-out-right', options.duration || 150);
            }
        };

        window.on('close', closeWindow);

        var swipeback = function()
        {
            if(document.body.classList.contains('swipeback'))
            {
                closeWindow();
            }
        };
        window.on('swiperight', swipeback);
        plus.key.addEventListener('backbutton', swipeback, false);

        document.on('tap', '.action-back', closeWindow);
    });

})();
