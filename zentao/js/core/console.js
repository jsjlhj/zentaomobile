(function() {
    'use strict';
    
    var cstyle = 
    {
        h1: 'font-size: 28px; font-weight: bold;',
        h2: 'font-size: 24px; font-weight: bold;',
        h3: 'font-size: 20px; font-weight: bold;',
        h4: 'font-size: 16px; font-weight: bold;',
        h5: 'font-size: 14px; font-weight: bold;',
        h5: 'font-size: 12px; font-weight: bold;',
        success: 'color: green; border-left: 10px solid green; padding-left: 5px;',
        danger: 'color: red; border-left: 10px solid red; padding-left: 5px;',
        warning: 'color: orange; border-left: 10px solid orange; padding-left: 5px;',
        info: 'color: blue; border-left: 10px solid blue; padding-left: 5px;',
        muted: 'color: gray; border-left: 10px solid gray; padding-left: 5px;',
        u: 'text-decoration: underline;',
        bd: 'border: 1px solid #ddd',
        bgsuccess: 'color: #fff; background: green; padding: 2px 5px;',
        bgdanger: 'color: #fff; background: red; padding: 2px 5px;',
        bgwarning: 'color: #fff; background: orange; padding: 2px 5px;',
        bginfo: 'color: #fff; background: blue; padding: 2px 5px;',
        bgmuted: 'color: #fff; background: gray; padding: 2px 5px;',
        bdsuccess: 'border:1px solid green;',
        bddanger: 'border:1px solid red;',
        bdwarning: 'border:1px solid orange;',
        bdinfo: 'border:1px solid blue;',
        bdmuted: 'border:1px solid gray;'
    };

    window.consolelog = function(text, style)
    {
        if (style.indexOf('|') >= 0)
        {
            var styles = style.split('|');
            style = '';
            for (var i = 0; i < (styles.length); ++i)
            {
                style += cstyle[styles[i]];
            };
        }
        else
        {
            style = cstyle[style] || style;
        }
        console.log('%c' + text, style);
    };

    console.color = window.consolelog;
    console.cstyle = cstyle;
}());
