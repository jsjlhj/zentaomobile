(function()
{
    'use strict';

    if(!window.plusReady)
    {
        /**
         * Called on plus ready
         * @param  {Function} callback
         * @return {window}
         */
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
        /**
         * Trigger event on the given webview
         * @param  {object} webview 
         * @param  {string} eventType
         * @param  {object} data   
         * @return {undefined}       
         */
        window.fire = function(webview, eventType, data)
        {
            console.groupCollapsed('%cFIRE: ' + eventType, 'color: #fff; background-color: orange;');
            console.log('webview', webview);
            console.log('data', data);
            console.groupEnd();
            
            if (webview)
            {
                webview.evalJS("window.receive&&window.receive('" + eventType + "','" + JSON.stringify(data ||
                {}) + "')");
            }
        };

        /**
         * Trigger event when receive an fire
         * @param  {string} eventType
         * @param  {object} data
         * @return {undefined}       
         */
        window.receive = function(eventType, data)
        {
            console.groupCollapsed('%cRECEIVE: ' + eventType, 'color: #fff; background-color: orange;');
            console.log('data', data);
            console.groupEnd();

            if (eventType)
            {
                data = JSON.parse(data);
                window.trigger(window, eventType, data);
            }
        };
    }

    if(!window.currentWebview)
    {
        window.plusReady(function()
        {
            /**
             * Set current webview to window
             */
            window.currentWebview = window.plus.webview.currentWebview();
        });
    }

    if(!window.openWebview)
    {
        window.openWebview = function(webview, options)
        {
            if(typeof webview.show !== 'function')
            {
                var isStr = (typeof webview === 'string'), wv;
                if(isStr)
                {
                    wv = plus.webview.getWebviewById(webview);
                }
                
                if(wv)
                {
                    webview = wv;
                }
                else
                {
                    var viewOptions = {};
                    if(isStr)
                    {
                        viewOptions.url = webview;
                        viewOptions.id = webview;
                    }
                    else
                    {
                        viewOptions = webview;
                    }
                    
                    webview = plus.webview.create(viewOptions.url, viewOptions.id || viewOptions.url, viewOptions.styles, viewOptions.extras);

                    if(options === undefined)
                    {
                        options = {};
                        options.waiting = viewOptions.waiting;
                        options.aniType = viewOptions.aniType;
                        options.duration = viewOptions.duration;
                    }
                }
            }

            options = Object.extend({waiting: true, aniType: 'auto', duration: 200}, options);

            if(options.waiting)
            {
                if(options.waiting === true)
                {
                    options.waiting = {title: ''};
                }
                else if(typeof options.waiting === 'string')
                {
                    options.waiting = {title: options.waiting};
                }
                webview.waitingWindow = plus.nativeUI.showWaiting(options.title, options.options);
            }

            webview.addEventListener('loaded', function()
            {
                if(options.waiting) webview.waitingWindow.close();
                webview.show(options.aniType, options.duration, options.callback);
            });

            return webview;
        };
    }
}());
