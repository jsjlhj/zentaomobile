(function()
{
    'use strict';

    var UDF = 'undifined';

    if(!window.plusReady)
    {
        window.plusReady = function(callback)
        {
            if (window.plus)
            {
                callback();
            }
            else
            {
                document.addEventListener("plusready", function()
                {
                    callback();
                }, false);
            }
            return window;
        };
    }

    if(typeof window.fire === UDF)
    {
        window.fire = function(webview, eventType, data)
        {
            if (webview)
            {
                webview.evalJS("window.receive&&window.receive('" + eventType + "','" + JSON.stringify(data ||
                {}) + "')");
            }
        };

        window.receive = function(eventType, data)
        {
            if (eventType)
            {
                data = JSON.parse(data);
                window.trigger(document, eventType, data);
            }
        };
    }
}());
