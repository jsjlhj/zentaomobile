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
        this.isLoading       = false;
        if(showfn) this.show = showfn;
        var that = this;

        document.$id('listview').on('tap', '.table-view-cell', function(e)
        {
            if(this.classList.contains('unread'))
            {
                document.getElementsByClassName('item-id-' + this.getAttribute('data-id')).forEach(function(el)
                {
                    el.classList.remove('unread');
                });
                this.classList.remove('unread');
                that.updateTabBadge();
            }
            that.showItem(this.getAttribute('data-id'), this);
        });

        window.plusReady(function()
        {
            window.on('reloadData', function(e){that.reload(e.detail);});
            window.on('showItem', function(e){that.showItem(e.detail);});
            window.on('closeDialog', function(e){that.closeDialog(e.detail);});
            window.on('endPullToRefresh', function(){window.currentWebview.endPullToRefresh();});

            window.userStore.init();
            that.datalist = new DataList(that.name);
            console.log('datalist', that.datalist);
            that.mainview = window.currentWebview.parent();
            that.showAll(false);
        });

        window.pullRefresh(
        {
            container: '#listview',//待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
            down :
            {
              contentdown    : "下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
              contentover    : "释放立即刷新",//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
              contentrefresh : "正在刷新...",//可选，正在刷新状态时，下拉刷新控件上显示的标题内容
              callback       : function(callback)
              {
                  window.fire(that.mainview, 'loadListView', {type: that.name, tab: that.currentFilter()});
              }
            }
        });
    };

    ListView.prototype.currentFilter = function()
    {
        return document.$id('listviewNav').$('.control-item.active').getAttribute('href').substr(0);
    };

    ListView.prototype.showItem = function(id, $item)
    {
        var item = this.datalist.getById(id);

        this.dialog = plus.webview.create(this.name + ".html", this.name + "-" + id, 
        {
            top             : "0",
            bottom          : "51px",
            bounce          : "vertical",
            scrollIndicator : "none"
        }, {options: {id: id, type: this.name, data: item}});
        this.dialog.show('slide-in-right', 200);
    };

    ListView.prototype.closeDialog = function(options)
    {
        if(this.dialog)
        {
            window.fire(this.dialog, 'close', options);
            this.dialog = null;
        }
    };

    ListView.prototype.showAll = function(makeRead)
    {
        var that = this;
        this.filters.forEach(function(val)
        {
            that.show(val, that.datalist.filter(val));
        });
        if(makeRead)
        {
            this.datalist.markRead();
            this.datalist.getUnreadCount(true);
        }
    };

    ListView.prototype.reload = function(options)
    {
        console.color('RELOAD', 'h5|bginfo');
        console.log('options', options);

        if(typeof options === 'function')
        {
            options = {callback: options};
        }

        if(this.isLoading)
        {
            options.callback && options.callback();
            return false;
        }

        this.datalist.loadFromStore();
        this.showAll(true);
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
                document.getElementById('listview').querySelectorAll('.table-view-cell').forEach(function(el)
                {
                    if(el.classList.contains('unread')) count++;
                });
            }
            var $tabBadge = document.$id('tab-badge-' + tab);
            $tabBadge.classList[count > 0 ? 'remove' : 'add']('mui-hidden');
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
