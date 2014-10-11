(function()
{
    // 空函数
    function shield() {return false;}

    // 取消浏览器的所有事件，使得active的样式在手机上正常生效
    document.addEventListener('touchstart', shield, false);
    // document.oncontextmenu = shield;//屏蔽选择函数

    window.plusReady(function()
    {
        var url = plus.webview.currentWebview().getURL();
        console.color('WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']', 'h1|bgmuted');
    });
})();
