/* 全局共享变量 */
var user = store.get('user', {});
var plus = window.plus;

(function(mui, $)
{
    function shield() {return false;}// 空函数
    document.addEventListener('touchstart',shield,false);//取消浏览器的所有事件，使得active的样式在手机上正常生效
    // document.oncontextmenu=shield;//屏蔽选择函数
    
    //全局配置(通常所有页面引用该配置，特殊页面使用mui.init({})来覆盖全局配置)
    mui.initGlobal(
    {
        optimize : true,
        swipeBack : true,
        showAfterLoad : true,
        titleBar : false,
        // back: function()
        // {
        //     return
        //     {
        //        preload : true
        //        //TODO 默认启用预加载等show，hide事件，动画都完成后放开预加载
        //     };
        // },
        show: 
        {
            aniShow : 'slide-in-right',
            duration : 400
        }
    });

    mui.ready(function()
    {
        if(!plus) { console.log('□ plus未准备就绪。'); return}

        var url = plus.webview.currentWebview().getURL();
        console.log('================================================');
        console.log('■ WEBVIEW 准备好了！ [' + url.substring(url.lastIndexOf('/')) + ']');

        // store.setPlusStorage(plus);
        zentao.setPlus(plus);

        // bind events
        $('body').on('tap', 'a', function(e)
        {
            var id = this.getAttribute('href');
            if(id && ~id.indexOf('.html'))
            {
                if(window.plus)
                {
                    $.openWindow({
                        id : id,
                        url : this.href,
                        preload : true//TODO 等show，hide事件，动画都完成后放开预加载
                    });
                } else {
                    document.location.href = this.href;
                }
            }
        });

        // Android处理返回键
        plus.key.addEventListener('backbutton',function()
        {
            if(confirm('确认退出？'))
            {
                plus.runtime.quit();
            }
        },false);
    });
})(mui, $);
