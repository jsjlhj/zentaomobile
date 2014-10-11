(function()
{
    'use strict';

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

    if(!window.fire)
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
                window.trigger(window, eventType, data);
            }
        };
    }
}());
