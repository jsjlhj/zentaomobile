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
}());

/**
 * pullRefresh
 */
(function(document)
{
    'use strict';

    var CLASS_PLUS_PULLREFRESH = 'plus-pullrefresh';
    var CLASS_CONTENT = 'content';
    var CLASS_IN = 'in';

    var SELECTOR_CONTENT = '.' + CLASS_CONTENT;

    var defaultOptions =
    {
        down:
        {
            height: 50,
            contentdown: '下拉可以刷新',
            contentover: '释放立即刷新',
            contentrefresh: '正在刷新...'
        },
        up:
        {
            contentdown: '上拉显示更多',
            contentrefresh: '正在加载...'
        }
    };

    var PlusPullRefresh = function(options)
    {
        options = Object.extend(defaultOptions, options, true);

        this.downOptions = options.down;
        this.upOptions = options.up;
        if (this.downOptions && this.downOptions.hasOwnProperty('callback'))
        {
            this.initPulldownRefresh();
        }
        if (this.upOptions && this.upOptions.hasOwnProperty('callback'))
        {
            this.initPullupRefresh();
        }
    };

    PlusPullRefresh.prototype.initPulldownRefresh = function()
    {
        var self = this;
        var sw = window.currentWebview;

        sw.setPullToRefresh(
        {
            support: true,
            height: self.downOptions.height + 'px',
            range: "200px",
            contentdown:
            {
                caption: self.downOptions.contentdown
            },
            contentover:
            {
                caption: self.downOptions.contentover
            },
            contentrefresh:
            {
                caption: self.downOptions.contentrefresh
            }
        }, function()
        {
            self.downOptions.callback && self.downOptions.callback.call(self);
        });
    };

    PlusPullRefresh.prototype.initPullupRefresh = function()
    {
        var self = this;
        var content = document.querySelector(SELECTOR_CONTENT);
        if (content)
        {
            self.bottomPocket = document.createElement('div');
            self.bottomPocket.className = 'pull-bottom-pocket';
            self.bottomPocket.innerHTML = '<div class="pull"><div class="pull-loading preloader"></div><div class="pull-caption">' + self.upOptions.contentdown + '</div></div>';
            content.appendChild(self.bottomPocket);

            self.pullLoading = self.bottomPocket.querySelector('.pull-loading');
            self.pullCaption = self.bottomPocket.querySelector('.pull-caption');

            self.isLoading = false;
            document.addEventListener('plusscrollbottom', self);
        }
    };
    PlusPullRefresh.prototype.handleEvent = function(event)
    {
        if (event.type === 'plusscrollbottom')
        {
            var self = this;
            if (self.isLoading) return;
            self.isLoading = true;
            setTimeout(function()
            {
                self.pullLoading.classList.add(CLASS_IN);
                self.pullCaption.innerHTML = '';
                self.pullCaption.innerHTML = self.upOptions.contentrefresh;
                var callback = self.upOptions.callback;
                callback && callback.call(self);
            }, 300);
        }
    };

    PlusPullRefresh.prototype.endPulldownToRefresh = function()
    {
        window.currentWebview.endPullToRefresh();
    };

    PlusPullRefresh.prototype.endPullupToRefresh = function(finished)
    {
        if (this.pullLoading)
        {
            this.pullLoading.classList.remove(CLASS_IN);
            this.pullCaption.innerHTML = this.upOptions.contentdown;
            this.isLoading = false;
            if (finished)
            {
                this.bottomPocket.classList.add('hidden');
                document.removeEventListener('plusscrollbottom', this);
            }
        }
    };

    /**
     * Pull refresh
     * @param  {object} options
     * @return {undefined}  
     */
    window.pullRefresh = function(options)
    {
        window.plusReady(function()
        {
            var self = document.body;
            var id = self.getAttribute('data-pullrefresh-plus');
            if (!id)
            {
                self.classList.add(CLASS_PLUS_PULLREFRESH);
                id = window.uuid();
                window.data[id] = new PlusPullRefresh(options);
                self.setAttribute('data-pullrefresh-plus', id);
            }
        });
    };
})(document);
