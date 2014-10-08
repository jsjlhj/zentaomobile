(function(mui, $)
{
    var $dialog = $('.dialog');

    mui.init({swipeBack: true});
    mui.plusReady(function()
    {
        var currentView = plus.webview.currentWebview();
        if(!currentView.dialogOptions) currentView.close('slide-out-right', 200);
    });

    document.addEventListener('tap', function()
    {
        $dialog.classList.toggle('show-more-info')
    }, false);
})(mui, $);
