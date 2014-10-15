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

        document.getElementById('listview').on('tab', '.table-view-cell', function(e)
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

            window.userStore.init();
            that.datalist = new DataList(that.name);
            console.log('datalist', that.datalist);
            that.mainview = plus.webview.currentWebview().parent();
            that.showAll(false);
        });

    };

    ListView.prototype.showItem = function(id, $item)
    {
        var item = this.datalist.getById(id);

        plus.webview.create(this.name + ".html", this.name + "-" + id, 
        {
            top             : "0",
            bottom          : "60px",
            bounce          : "vertical",
            scrollIndicator : "none"
        }, {options: {id: id, type: this.name, data: item}}).show('slide-in-right', 200);
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

// function listView(options)
// {
//     subTabs = options.tabs,
//     type    = options.type;

//     // mui.init(
//     // {
//     //     swipeBack: false,

//     //     pullRefresh:
//     //     {
//     //         container: '#' + type + 'List',
//     //         down:
//     //         {
//     //             contentdown    : "下拉可以刷新",
//     //             contentover    : "释放立即刷新",
//     //             contentrefresh : "正在刷新...",
//     //             callback       : function(callback)
//     //             {
//     //                 reload({callback: callback, makeRead: true});
//     //             }
//     //         }
//     //     }
//     // });
// }

