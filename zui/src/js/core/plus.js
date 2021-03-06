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
            // console.groupCollapsed('%cFIRE: ' + eventType, 'color: #fff; background-color: orange;');
            // console.log('webview', webview);
            // console.log('data', data);

            window.data = data;
            
            if (webview)
            {
                var js = "window.receive&&window.receive('" + eventType + "','" + JSON.stringify(data ||
                {}).replace(/'/g, "\\'") + "')";
                // console.log('js', js);
                webview.evalJS(js);
            }

            // console.groupEnd();
        };

        /**
         * Trigger event when receive an fire
         * @param  {string} eventType
         * @param  {object} data
         * @return {undefined}       
         */
        window.receive = function(eventType, data)
        {
            // console.groupCollapsed('%cRECEIVE: ' + eventType, 'color: #fff; background-color: orange;');
            // console.log('data', data);
            // console.groupEnd();

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

        window.openWindow = function(options, showOptions)
        {
            var webview;
            if(typeof options === 'string')
            {
                webview = plus.webview.getWebviewById(options);

                if(!webview)
                {
                    options = {url: options, id: options};
                }
            }

            if(!webview)
            {
                webview = plus.webview.create(options.url, options.id || options.url, options.styles, options.extras);

                if(showOptions === undefined)
                {
                    showOptions = {};
                    showOptions.waiting = options.waiting;
                    showOptions.aniType = options.aniType;
                    showOptions.duration = options.duration;
                }
            }

            return window.openWebview(webview, showOptions);
        };
    }
}());
