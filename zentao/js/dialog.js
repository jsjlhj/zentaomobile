(function(mui, $)
{
    mui.init({swipeBack: true});
    mui.plusReady(function()
    {
        var currentView = plus.webview.currentWebview();
        if(!currentView.dialogOptions) currentView.close('slide-out-right', 200);
    });
})(mui, $);
