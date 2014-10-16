(function()
{
    window.plusReady(function()
    {
        var url = window.currentWebview.getURL();
        console.color('WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']', 'h1|bgmuted');
    });
})();
