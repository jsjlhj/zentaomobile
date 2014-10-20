(function()
{
    var filters = 
    {
        todo  : ['today', 'yestoday', 'thisweek', 'undone'],
        task  : ['assignedTo', 'openedBy', 'finishedBy'],
        bug   : ['assignedTo', 'openedBy', 'resolvedBy'],
        story : ['assignedTo', 'openedBy', 'reviewedBy']
    };

    var ListView = function(name, showfn)
    {
        this.name            = name;
        this.filters         = filters[name];
        this.lessCount       = Math.floor((window.getViewport().height - 34)/45) + 1;
        if(showfn) this.show = showfn;
        var that = this;

        document.$id('listview').on('tap', '.table-view-cell', function(e)
        {
            var tab = this.getAttribute('data-tab');
            if(this.classList.contains('show-more'))
            {
                that.lessCount = false;
                that.show(tab, that.datalist.filter(tab), that.lessCount);
            }
            else if(this.classList.contains('nomore-tip'))
            {
                return;
            }
            else
            {
                if(this.classList.contains('unread'))
                {
                    var id = this.getAttribute('data-id');
                    document.$class('item-id-' + id).forEach(function(el)
                    {
                        el.classList.remove('unread');
                    });
                    this.classList.remove('unread');

                    that.datalist.markRead(id);
                    window.fire(window.plus.webview.currentWebview().opener(), 'markRead', {name: that.name, id: id});
                    that.updateTabBadge();
                }
                that.showItem(this.getAttribute('data-id'), this);
            }
        });

        window.plusReady(function()
        {
            window.on('reloadData', function(e){that.reload(e.detail);});
            window.on('showItem', function(e){that.showItem(e.detail);});
            window.on('closeDialog', function(e){that.closeDialog(e.detail);});
            window.on('endPullToRefresh', function(){window.currentWebview.endPullToRefresh();});

            window.userStore.init();
            that.datalist = new DataList(that.name);
            // console.log('datalist', that.datalist);
            that.showAll(false);
        });

        window.pullRefresh(
        {
            container: '#listview',
            down :
            {
              contentdown    : "下拉可以刷新",
              contentover    : "释放立即刷新",
              contentrefresh : "正在刷新...",
              callback       : function(callback)
              {
                  that.datalist.markRead();
                  that.showAll();
                  window.fire(window.plus.webview.currentWebview().opener(), 'markRead', {name: that.name});
                  window.fire(window.plus.webview.currentWebview().opener(), 'loadListView', {type: that.name, tab: that.currentFilter()});
              }
            }
        });
    };

    ListView.prototype.currentFilter = function()
    {
        return document.$id('listviewNav').$('.control-item.active').getAttribute('href').substr(1);
    };

    ListView.prototype.showItem = function(id, $item)
    {
        var item = this.datalist.getById(id);
        this.dialog = window.openWindow(
        {
            url: this.name + ".html",
            id: this.name + "-" + id,
            styles:
            {
                top             : "0",
                bottom          : "51px",
                bounce          : "vertical",
                scrollIndicator : "none"
            },
            aniType: 'slide-in-right',
            extras:
            {
                options: {id: id, type: this.name, data: item}
            }
        });
    };

    ListView.prototype.closeDialog = function(options)
    {
        if(this.dialog)
        {
            window.fire(this.dialog, 'close', options);
            this.dialog = null;
        }
    };

    ListView.prototype.showAll = function()
    {
        var that = this;
        this.filters.forEach(function(val)
        {
            that.show(val, that.datalist.filter(val), that.lessCount);
        });
    };

    ListView.prototype.reload = function(options)
    {
        // console.color('RELOAD', 'h5|bginfo');
        // console.log('options', options);

        if(typeof options === 'function')
        {
            options = {callback: options};
        }

        this.datalist.loadFromStore();
        this.showAll();
        options.callback && options.callback();
        return true;
    };

    ListView.prototype.updateTabBadge = function(tab, count)
    {
        if(tab)
        {
            if(typeof count === 'undefined')
            {
                count = 0;
                document.$class('table-view-cell', document.$id(tab)).forEach(function(el)
                {
                    if(el.classList.contains('unread')) count++;
                });
            }
            var $tabBadge = document.$id('tab-badge-' + tab);
            $tabBadge.classList[count > 0 ? 'remove' : 'add']('hidden');
            $tabBadge.innerHTML = count;
        }
        else
        {
            var that = this;
            this.filters.forEach(function(val)
            {
                that.updateTabBadge(val);
            });
        }
    };

    window.ListView = ListView;
}());
