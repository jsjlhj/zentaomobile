(function()
{
    window.plusReady(function()
    {
        var url = plus.webview.currentWebview().getURL();
        console.color('WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']', 'h1|bgmuted');
    });
})();
