var subTabs,
    type;

function listView(options)
{
    subTabs = options.tabs,
    type    = options.type;

    mui.init(
    {
        swipeBack: false,

        pullRefresh:
        {
            container: '#' + type + 'List',
            down:
            {
                contentdown: "下拉可以刷新",
                contentover: "释放立即刷新",
                contentrefresh: "正在刷新...",
                callback: function(callback)
                {
                    reload(callback);
                }
            }
        }
    });

    document.querySelector("#slider .mui-slider-group").addDelegateListener("tap", ".mui-table-view-cell", function(e)
    {
        if(this.classList.contains('unread'))
        {
            $('.item-id-' + this.getAttribute('data-id')).forEach(function(el)
            {
                el.classList.remove('unread');
            });
            this.classList.remove('unread');
            updateTabBadge();
        }
        showItem(this.getAttribute('data-id'), this);
    });

    zentao.ready(function()
    {
        showAll();
        reload(true);
    });
}

function updateTabBadge(tab, count)
{
    if(tab)
    {
        if(typeof count === 'undefined')
        {
            count = 0;
            $('#' + tab + ' .mui-table-view-cell').forEach(function(el)
            {
                if(el.classList.contains('unread')) count++;
            });
        }
        var $tabBadge = $('.tab-badge-' + tab);
        $tabBadge.classList[count > 0 ? 'remove' : 'add']('mui-hidden');
        $tabBadge.innerHTML = count;
    }
    else
    {
        subTabs.forEach(function(val)
        {
            updateTabBadge(val);
        });
    }
}

function reload(callback, offline)
{
    console.log('reload', callback, offline);
    if(!zentao.isReady)
    {
        throw new Error('禅道未准备就绪，无法获取数据');
        return;
    };

    if(callback !== true) // checkuser status
    {
        var currentUser = window.storage.getUser();
        if(!currentUser || currentUser.status !== 'online')
        {
            if(window.plus)
            {
                window.plus.nativeUI.toast('离线状态下，无法更新数据');
            }
            showAll();
            callback && callback();
            return false;
        }
    }

    if(offline)
    {
        showAll();
        callback && callback();
    }
    else
    {
        zentao.loadData(type, function(data)
        {
            showAll();
            if(typeof callback === 'function') callback && callback();
        }, callback);
    }
}

function showAll()
{
    subTabs.forEach(function(val)
    {
        show(val);
    });
    zentao.data[type].markRead();
}

function showItem(id, $item)
{
    plus.webview.create(type + ".html", type + "-" + id, 
    {
        top             : "44px",
        bottom          : "0px",
        bounce          : "vertical",
        scrollIndicator : "none"
    }, {dialogOptions: {id: id, type: type}}).show('slide-in-right', 200);
};

