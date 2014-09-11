(function(mui, $)
{
    mui.init({swipeBack: true});
    mui.plusReady(function()
    {
        // Android处理返回键
        // plus.key.addEventListener('backbutton', function()
        // {
        //     if(window.closeDialog) window.closeDialog();
        //     else plus.webview.currentWebview().close('slide-out-right', 200);
        // }, false);

        // init options
        
        var currentView = plus.webview.currentWebview();
        if(!currentView.dialogOptions) currentView.close('slide-out-right', 200);
    });
})(mui, $);
