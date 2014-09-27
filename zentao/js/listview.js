var subTabs,
    type,
    mainview;

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

    zentao.ready(function()
    {
        mainview = plus.webview.currentWebview().parent();
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
    console.color('RELOAD offline=' + offline, 'h5|bginfo');
    console.log('callback', callback);

    if(!zentao.isReady)
    {
        if(typeof callback === 'function') callback();
        return false;
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
            offline = true;
        }
    }

    if(offline)
    {
        showAll();
    }
    else
    {
        var callCallback = function()
        {
            if(typeof callback === 'function') callback();
            mui.fire(mainview, 'stopSync');
        }
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

