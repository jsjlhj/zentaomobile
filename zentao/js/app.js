(function()
{
    var isLoging        = false,
        network         = 'wifi',
        $status         = document.getElementById('userStatus'),
        $statusName     = document.getElementById('userStatusName'),
        $settingBtn     = document.getElementById('settingBtn'),
        animateSpeed    = 200,
        receiveNotify   = true,
        syncInterval    = 20000,
        listViewsOrder  = {todo: 1, task: 2, bug: 3, story: 4},
        listViews       = {todo: "todos.html", task: "tasks.html", bug: "bugs.html", story: "stories.html"},
        loginWindow,
        settingWindow,
        firstBackbutton,
        waitingTip,
        mainView,
        currentListView,
        defaultListView;

    var openLoginWindow = function()
    {
        if(loginWindow)
        {
            console.error('登录窗口已经打开。');
            return;
        }
        var status = window.user.status;
        var options = {offline: status == 'offline' || status == 'disconnect'};
        if(window.user.account)
        {
            options.account = window.user.account;
            options.url = window.user.url;
        }

        loginWindow = window.openWindow(
        {
            url: 'login.html',
            id: 'login',
            styles:
            {
                top             : "0px",
                bottom          : "0px",
                bounce          : "vertical",
                scrollIndicator : "none"
            },
            aniType: 'fade-in',
            duration: 200,
            extras: {options: options}
        });
        loginWindow.addEventListener('close', function()
        {
            loginWindow = null;
        });
    };

    var openListView = function(options)
    {
        if(typeof options === 'string'){options = {name: options};}
        else if(!options) options = {};

        if(!defaultListView) defaultListView = window.userStore.get('lastListView', 'todo');
        options.name = options.name || currentListView || defaultListView;

        var lastListView = listViews[currentListView];
        var aniType = 'none';

        if(lastListView)
        {
            // aniType = listViewsOrders.name] < listViewsOrdertListView] ? 'slide-out-right' : 'slide-out-left';
            window.fire(lastListView, 'closeDialog', {aniClose: 'fade-out'});

            if(currentListView === options.name)
            {
                window.fire(lastListView, 'reloadData', options);
                return;
            }

            lastListView.hide(aniType, animateSpeed);
        }

        if(typeof listViews[options.name] === 'string')
        {
            var view = listViews[options.name] = plus.webview.create(listViews[options.name], options.name, 
            {
                top             : "44px",
                bottom          : "51px",
                bounce          : "vertical",
                scrollIndicator : "none"
            });

            showWaiting();
            setTimeout(function()
            {
                mainView.append(view);
                hideWaiting();
            }, 500);
        }
        else
        {
            // aniType = listViewsOrders.name] > listViewsOrdertListView] ? 'slide-in-right' : 'slide-in-left';
            listViews[options.name].show(aniType, animateSpeed);
        }

        document.getElementsByClassName('open-listview').forEach(function(el)
        {
            el.classList[el.getAttribute('data-id') === options.name ? 'add' : 'remove']('active');
        });

        currentListView = options.name;
        window.userStore.set('lastListView', currentListView);
    };

    var tryLogin = function(key)
    {
        var withUi = key && key.ui && loginWindow;

        if(isLoging && zentao.isReady)
        {
            if(withUi)
            {
                window.fire(loginWindow, 'logged', {result: false, message: '系统正忙，稍后再试。'});
            }
            return false;
        }

        if(withUi)
        {
            key.pwdMd5 = window.md5(key.pwdMd5);
        }
        zentao.login(key, function()
        {
            if(withUi)
            {
                window.fire(loginWindow, 'logged', {result: true});
            }
        }, function(e)
        {
            if(withUi)
            {
                window.fire(loginWindow, 'logged', {result: false, message: e.message || '登录失败'});
            }
            else
            {
                window.plus.nativeUI.toast('无法连接到服务器，您可以离线使用。');
            }
        });
    };

    var logout = function(options)
    {
        options = options ? (options.detail || options) : {};
        if(options.updateSetting)
        {
            updateSetting(options.updateSetting);
        }
        zentao.logout(false, checkStatus);
    };

    var checkStatus = function()
    {
        var status = window.user ? window.user.status : 'logout';

        console.color('CHECKSTATUS:' + status, 'h5|bgwarning');

        $settingBtn.classList.remove('hidden');
        if(status === 'logout')
        {
            $statusName.innerHTML = '请登录';
            $status.setAttribute('data-status', 'offline');

            $settingBtn.classList.add('hidden');
            openLoginWindow();
        }
        else if(status === 'online')
        {
            $statusName.innerHTML = '在线';
            $status.setAttribute('data-status', 'online');

            setTimeout(function()
            {
                if(user.status === 'online') $statusName.classList.add('hide-name');
            }, 2000);
            openListView({checkStatus: true});
        }
        else if(status === 'disconnect')
        {
            $statusName.innerHTML = '没有网络';
            $status.setAttribute('data-status', 'disconnect');

            setTimeout(function()
            {
                if(status === 'disconnect')
                {
                    $statusName.innerHTML = '离线';
                    $status.setAttribute('data-status', 'offline');
                }
            }, 10000);
        }
        else
        {
            $statusName.innerHTML = '离线';
            $status.setAttribute('data-status', 'offline');
        }
    };

    var startSync = function()
    {
        $status.classList.add('syncing');
    };

    var stopSync = function()
    {
        $status.classList.remove('syncing');
    };

    var restartSync = function()
    {
        zentao.restartAutoSync(syncInterval);
    };

    var onResume = function()
    {
        zentao.runningInBackground = false;
        plus.runtime.setBadgeNumber(0);
        plus.push.clear();
        console.color('RUNNING IN FRONT', 'bgsuccess');
    };

    var onPause = function()
    {
        zentao.runningInBackground = true;
        console.color('RUNNING IN BACKGROUND', 'bgdanger');
    };

    var showWaiting = function(e)
    {
        var options = e ? (e.detail || e) : {title: ''};
        waitingTip = plus.nativeUI.showWaiting(options.title, options.options);
    };

    var hideWaiting = function()
    {
        if(waitingTip)
        {
            waitingTip.close();
            waitingTip = null;
        }
    };

    var onNetChange = function()
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
            checkStatus();
        }
        else if(user.status !== 'online' && network != 'disconnect')
        {
            tryLogin();
        }
    };

    /**
     * Load data from server manually
     * @param  {object} options
     * @return {undefined}
     */
    var loadListView = function(options)
    {
        options = options.detail || options;
        var view = listViews[options.type];
        startSync();
        zentao.loadData(options, function(datalist)
        {
            updateListBadge(options.type);
            if(typeof view == 'object')
            {
                window.fire(view, 'reloadData');
                window.fire(view, 'endPullToRefresh');
            }
            stopSync();
        }, function(e)
        {
            window.plus.nativeUI.toast('无法加载数据。' + e.message);
            if(typeof view == 'object')
            {
                window.fire(view, 'endPullToRefresh');
            }
            stopSync();
        });
    };

    var updateSetting = function(e)
    {
        var options = e ? (e.detail || e) : {};

        receiveNotify   = options.receiveNotify;
        window.userStore.set('receiveNotify', receiveNotify);

        if(syncInterval != options.syncInterval)
        {
            syncInterval    = options.syncInterval;
            window.userStore.set('syncInterval', syncInterval);
            restartSync();
        }

        checkStatus();
    };

    var updateListBadge = function(list)
    {
        var datalist = zentao.data[list];
        if(datalist)
        {
            var unreadCount = datalist.getUnreadCount();
            var $listNav = document.$id('tab-' + list);
            $listNav.classList[unreadCount > 0 ? 'add' : 'remove']('unread');
            $listNav.$('.unread-count').innerHTML = unreadCount < 100 ? unreadCount : '99+';
        }
    };

    var markRead = function(tab, id)
    {
        var datalist = zentao.data[tab];
        if(datalist)
        {
            datalist.markRead(id);
            updateListBadge(tab);
        }
    };

    $status.on('tap', function()
    {
        var user = window.user;
        if(!user || user.status != 'online')
        {
            openLoginWindow();
        }
    });

    $settingBtn.on('tap', function()
    {
        var options =
        {
            user          : window.user,
            receiveNotify : receiveNotify,
            syncInterval  : syncInterval
        };
        settingWindow = window.openWindow(
        {
            url: 'setting/index.html',
            id: 'setting',
            styles:
            {
                top             : "0px",
                bottom          : "0px",
                bounce          : "vertical",
                scrollIndicator : "none"
            },
            aniType: 'slide-in-right',
            extras: {options: options}
        });
        settingWindow.addEventListener('close', function(){settingWindow = null;});
    });

    document.getElementById('listviewNav').on('tap', '.open-listview', function()
    {
        openListView(this.getAttribute('data-id'));
    });

    window.on('login', function(e){tryLogin(e.detail);})
          .on('openLogin', openLoginWindow)
          .on('logout', logout)
          .on('checkStatus', checkStatus)
          .on('openListView', function(e){openListView(e.detail);})
          .on('startSync', startSync)
          .on('stopSync', stopSync)
          .on('restartSync', restartSync)
          .on('showWaiting', showWaiting)
          .on('hideWaiting', hideWaiting)
          .on('updateSetting', updateSetting)
          .on('loadListView', loadListView)
          .on('markRead', function(e)
          {
              var options = e && e.detail ? e.detail : {name: currentListView};
              markRead(options.name, options.id);
          });

    zentao.on('logging', function()
    {
        isLoging = true;
        $statusName.innerHTML = '登录中...';
        $status.setAttribute('data-status', 'logging');
    }).on('logged', function(result)
    {
        console.color('logged: ' + result, 'h4|bg' + (result ? 'success' : 'danger'));
        isLoging = false;
        checkStatus();
    }).on('syncing', function()
    {
        // startSync();
    }).on('sync', function(e)
    {
        if(e.result)
        {
            console.color('SYNC>>> ' + e.tab, 'h5|bginfo');
            updateListBadge(e.tab);

            var currentWin = listViews[e.tab];
            if(typeof currentWin === 'object')
            {
                window.fire(currentWin, 'reloadData', {offline: true});
            }

            if(e.tab != currentListView && e.unreadCount)
            {
                document.getElementById('tab-' + e.tab).classList.add('unread');
            }

            if(receiveNotify && zentao.runningInBackground)
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

            lastSyncTime = new Date().getTime();
        }
        stopSync();
    }).on('ready', function()
    {
        openListView({offline: true});
        for(var key in listViews)
        {
            updateListBadge(key);
        }

        if(window.userStore.get('autoSync', true))
        {
            zentao.startAutoSync(syncInterval);
        }

        receiveNotify = window.userStore.get('receiveNotify', receiveNotify);
        syncInterval = window.userStore.get('syncInterval', syncInterval);
    });

    window.plusReady(function()
    {
        window.plus.navigator.setStatusBarBackground( "#FAFAFA" );

        setTimeout(plus.navigator.closeSplashscreen, 200);
        
        mainView = plus.webview.currentWebview();
        
        if(window.user.status === 'online') window.user.status = 'offline';
        checkStatus();
        if(window.user.status != 'logout') tryLogin();

        document.addEventListener('netchange', onNetChange, false);
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);

        plus.push.addEventListener('click', function(msg)
        {
            if(lastPush)
            {
                openListView({name: lastPush.tab, offline: true});
                if(lastPush.unreadCount === 1 && lastPush.latestItem)
                {
                    window.fire(windows[currentListView], 'showItem', lastPush.latestItem.id);
                }
            }
        }, false);

        plus.key.addEventListener('backbutton', function()
        {
            if(!firstBackbutton)
            {
                window.plus.nativeUI.toast('再按一次退出应用');
                firstBackbutton = new Date().getTime();
                setTimeout(function(){firstBackbutton = null;}, 1000);
                return false;
            }
            else
            {
                if((new Date().getTime() - firstBackbutton) < 1000)
                {
                    plus.runtime.quit();
                }
                else
                {
                    return false;
                }
            }
        }, false);

        console.color('app plus ready', 'bgsuccess');
    });
}());
