var subTabs,
    type,
    mainview,
    isLoading;

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
                contentdown    : "下拉可以刷新",
                contentover    : "释放立即刷新",
                contentrefresh : "正在刷新...",
                callback       : function(callback)
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

    mui.plusReady(function()
    {
        window.addEventListener('reloadData', function(e){reload(e.detail)});
    });

    zentao.ready(function()
    {
        mainview = plus.webview.currentWebview().parent();
        showAll();
        reload({offline: true});
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

function reload(options)
{
    console.color('RELOAD' 'h5|bginfo');
    console.log('options', options);

    if(typeof options === 'function')
    {
        options = {callback: options};
    }

    if(!zentao.isReady || isLoading)
    {
        options.callback && options.callback();
        return false;
    }

    if(options.checkStatus)
    {
        var currentUser = window.storage.getUser();
        if(!currentUser || currentUser.status !== 'online')
        {
            if(window.plus)
            {
                window.plus.nativeUI.toast('离线状态下，无法更新数据');
            }
            options.offline = true;
        }
    }

    if(options.offline)
    {
        showAll();
    }
    else
    {
        var callCallback = function()
        {
            options.callback && options.callback();
            mui.fire(mainview, 'stopSync');
            isLoading = false;
        }

        isLoading = true;
        mui.fire(mainview, 'startSync');
        zentao.loadData(type, function(data)
        {
            showAll();
            callCallback();
        }, callCallback);
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

