(function(window)
{
    window.CONFIG =
    {
        "debug"   : 0,
        "screen"  : {width: 320, height: 568},
        "version" : "0.1.6 beta"
    };

    console.options.DEBUG = window.CONFIG.debug;

    if(window.CONFIG.screen)
    {
        var sc = window.CONFIG.screen;
        sc.oldWidth = window.innerWidth;
        sc.oldHeight = window.innerHeight;
        sc.top = sc.bottom = (sc.oldHeight - sc.height) / 2;
        sc.left = sc.right = (sc.oldWidth - sc.width) / 2;
    }
})(window);
