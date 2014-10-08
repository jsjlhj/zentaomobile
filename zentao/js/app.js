(function(mui, $)
{
    var $content        = $('#content'),
        animateSpeed    = 200,
        windows         = {todo: "todos.html", task: "tasks.html", bug: "bugs.html", story: "stories.html"},
        mainView,
        currentTab,
        subTabs         = {todo: 1, task: 2, bug: 3, story: 4},
        defaultTab,
        firstBackbutton = null,
        loginWindow,
        isLoging        = false,
        network         = 'wifi',
        lastPush        = null,
        settingWindow;

    mui.init(
    {
        swipeBack: false,
        back: function()
        {
            if(!firstBackbutton)
            {
                window.plus.nativeUI.toast('再按一次退出应用');
                firstBackbutton = new Date().getTime();
                setTimeout(function(){firstBackbutton = null}, 1000);
                return false;
            }
            else
            {
                return (new Date().getTime() - firstBackbutton) < 1000;
            }
        }
    });

    mui.plusReady(function()
    {
        setTimeout(plus.navigator.closeSplashscreen, 200);

        mainView = plus.webview.currentWebview();
        document.getElementById('subpageNav').addDelegateListener('tap', '.open-subpage', function()
        {
            var tab = this.getAttribute('data-id');
            // $('#appTitle').innerHTML = zentao.dataTabs[tab].name;
            openSubWin(tab);
            this.classList.remove('unread');
            zentao.data[tab].getUnreadCount(true);
        });

        // Bind custom events
        window.addEventListener('startSync', startSync, false);
        window.addEventListener('stopSync', stopSync, false);
        window.addEventListener('restartSync', function()
        {
            zentao.restartAutoSync();
        }, false);

        // Bind html5+ events
        document.addEventListener('netchange', onNetChange, false);
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);

        window.plus.navigator.setStatusBarBackground( "#FAFAFA" );

        plus.push.addEventListener('click', function(msg)
        {
            if(lastPush)
            {
                openSubWin({tab: lastPush.tab, offline: true});
                $('#tab-' + lastPush.tab).classList.remove('unread');
                if(lastPush.unreadCount === 1 && lastPush.latestItem)
                {
                    mui.fire(windows[currentTab], 'showItem', lastPush.latestItem.id);
                }
            }
        }, false);

        console.color('app plus ready', 'bgsuccess');
    });

    var $status     = $('#userStatus'),
        $statusName = $('#userStatusName'),
        $settingBtn = $('#settingBtn');
    zentao.on('logging', function()
    {
        isLoging = true;
        $statusName.innerHTML = '登录中...';
        $status.setAttribute('data-status', 'logging');
    }).on('logged', function(result)
    {
        isLoging = false;
        console.color('logged: ' + result, 'h4|bg' + (result ? 'success' : 'danger'));
        checkUserStatus();
    }).on('syncing', function()
    {
        startSync();
    }).on('sync', function(e)
    {
        if(e.result)
        {
            console.color('SYNC>>> ' + e.tab, 'h5|bginfo');
            var currentWin = windows[e.tab];
            if(typeof currentWin === 'object')
            {
                mui.fire(currentWin, 'reloadData', {offline: true});
            }

            if(e.tab != currentTab && e.unreadCount)
            {
                $('#tab-' + e.tab).classList.add('unread');
            }


            if(window.storage.get('receiveNotify', true) && zentao.runningInBackground)
            {
                var unreadCount = e.unreadCount;
                plus.runtime.setBadgeNumber(unreadCount);

                if(unreadCount)
                {
                    var message;
                    lastPush = e;
                    if(unreadCount > 1)
                    {
                        message = '收到' + unreadCount + '个新的' + zentao.dataTabs[e.tab].name;
                    }
                    else
                    {
                        message = '新的' + zentao.dataTabs[e.tab].name + ": " + (e.latestItem.name || e.latestItem.title);
                    }
                    plus.push.createMessage(message, "LocalMSG", {cover: true, test: 'testtest4343'});
                    console.color('消息已推送：' + message, 'h3|info');
                }
            }
        }
        stopSync();
    }).on('ready', function()
    {
        openSubWin({offline: true});
        if(window.storage.get('autoSync', true))
        {
            zentao.startAutoSync();
        }
    });

    $status.on('tap', function()
    {
        var user = window.user;
        if(!user || user.status != 'online')
        {
            openLoginWindow();
        }
    });

    $('#settingBtn').on('tap', function()
    {
        settingWindow = plus.webview.create('setting/index.html', 'setting', 
        {
            top             : "0px",
            bottom          : "0px",
            bounce          : "vertical",
            scrollIndicator : "none"
        });
        settingWindow.addEventListener('close', checkUserStatus);
        settingWindow.show('slide-in-right', 200);
    });

    zentao.ready(function()
    {
        checkUserStatus('mild', true);
    });

    function tryLogin()
    {
        if(!isLoging && zentao.isReady)
        {
            zentao.login();
        }
    }

    function onResume()
    {
        zentao.runningInBackground = false;
        plus.runtime.setBadgeNumber(0);
        plus.push.clear();
        console.color('RUNNING IN FRONT', 'bgsuccess');
    }

    function onPause()
    {
        zentao.runningInBackground = true;
        console.color('RUNNING IN BACKGROUND', 'bgdanger');
    }

    function onNetChange()
    {
        var nt = plus.networkinfo.getCurrentType();
        switch ( nt ) 
        {
            case plus.networkinfo.CONNECTION_ETHERNET:
            case plus.networkinfo.CONNECTION_WIFI:
            network = 'wifi';
            break; 
            case plus.networkinfo.CONNECTION_CELL2G:
            case plus.networkinfo.CONNECTION_CELL3G:
            case plus.networkinfo.CONNECTION_CELL4G:
            network = 'mobile';
            break; 
            default:
            network = 'disconnect';
            break;
        }
        zentao.network = network;
        console.color('NET CHANGE:' + network, "h3|bgdanger");

        var user   = window.user;
        if(user.status === 'online' && network === 'disconnect')
        {
            user.status = 'disconnect';
            checkUserStatus('mild');
        }
        else if(user.status !== 'online' && network != 'disconnect')
        {
            tryLogin();
        }
    }

    function checkUserStatus(mild, first)
    {
        var md     = mild === 'mild';
        var user   = window.storage.getUser();

        $status.classList.remove('hide-name');
        if(!user || user.status === 'logout')
        {
            $statusName.innerHTML = '请登录';
            $status.setAttribute('data-status', 'offline');
            $settingBtn.classList.add('mui-hidden');
            openLoginWindow();
        }
        else if(first)
        {
            user.status           = 'offline';
            $statusName.innerHTML = '离线';
            $status.setAttribute('data-status', 'offline');
            if(md) tryLogin();
            $settingBtn.classList.remove('mui-hidden');
        }
        else if(user.status === 'online')
        {
            $statusName.innerHTML = '在线';
            $status.setAttribute('data-status', 'online');
            setTimeout(function()
            {
                if(user.status === 'online') $status.classList.add('hide-name');
            }, 2000);
            openSubWin({checkStatus: true});
            $settingBtn.classList.remove('mui-hidden');
        }
        else if(user.status === 'disconnect')
        {
            $statusName.innerHTML = '没有网络';
            $status.setAttribute('data-status', 'disconnect');
            setTimeout(function()
            {
                if(user.status === 'disconnect')
                {
                    $statusName.innerHTML = '离线';
                    $status.setAttribute('data-status', 'offline');
                }
            }, 10000);
            $settingBtn.classList.remove('mui-hidden');
        }
        else
        {
            $statusName.innerHTML = '离线';
            $status.setAttribute('data-status', 'offline');
            if(md) tryLogin();
            $settingBtn.classList.remove('mui-hidden');
        }

        console.color('CHECK STATUS:' + user.status + ' ' + $statusName.innerHTML, 'h5|info');
    }

    function openLoginWindow()
    {
        loginWindow = plus.webview.create('login.html', 'login', 
        {
            top             : "0px",
            bottom          : "0px",
            bounce          : "vertical",
            scrollIndicator : "none"
        });
        loginWindow.addEventListener('close', checkUserStatus);
        loginWindow.show('zoom-in', 200);
    }

    function openSubWin(options)
    {
        if(typeof options === 'string')
        {
            options = {tab: options};
        }

        if(!options) options = {};

        if(!defaultTab)
        {
            defaultTab = window.storage.get('lastTab', 'todo');
        }

        options.tab = options.tab || currentTab || defaultTab;

        var currentWin = windows[currentTab];

        if(currentWin && currentTab === options.tab)
        {
            mui.fire(currentWin, 'reloadData', options);
            return;
        }

        var aniType = 'none';
        if(currentWin)
        {
            // aniType = subTabs[options.tab] < subTabs[currentTab] ? 'slide-out-right' : 'slide-out-left';
            currentWin.hide(aniType, animateSpeed);
            var openeds = currentWin.opened();
            openeds.forEach(function(opendedDialog)
            {
                if(opendedDialog.dialogOptions)
                {
                    opendedDialog.hide('zoom-out', 100);
                }
            });
        }
        if(typeof windows[options.tab] === 'string')
        {
            windows[options.tab] = plus.webview.create(windows[options.tab], options.tab, 
            {
                top             : "44px",
                bottom          : "60px",
                bounce          : "vertical",
                scrollIndicator : "none"
            });

            mainView.append(windows[options.tab]);
        }
        else
        {
            // aniType = subTabs[options.tab] > subTabs[currentTab] ? 'slide-in-right' : 'slide-in-left';
            windows[options.tab].show(aniType, animateSpeed);
        }

        $('.open-subpage').forEach(function(el)
        {
            el.classList[el.getAttribute('data-id') === options.tab ? 'add' : 'remove']('mui-active');
        });

        currentTab = options.tab;
        window.storage.set('lastTab', currentTab);
    }

    function startSync()
    {
        $('#userStatus').classList.add('syncing');
    }

    function stopSync()
    {
        $('#userStatus').classList.remove('syncing');
    }
})(mui, $);
