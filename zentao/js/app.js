(function()
{
    var isLoging        = false,
        network         = 'wifi',
        $status         = document.getElementById('userStatus'),
        $statusName     = document.getElementById('userStatusName'),
        $settingBtn     = document.getElementById('settingBtn'),
        animateSpeed    = 100,
        receiveNotify   = true,
        syncInterval    = 20000,
        // listViewsOrder  = {todo: 1, task: 2, bug: 3, story: 4},
        listViews       = {todo: "todos.html", task: "tasks.html", bug: "bugs.html", story: "stories.html"},
        itemView,
        loginWindow,
        markReadTip,
        settingWindow,
        firstBackbutton,
        waitingTip,
        lastPush,
        lastSyncTime,
        mainView,
        firstSync,
        currentListView,
        listViewStyle =
        {
            top             : "44px",
            bottom          : "51px",
            bounce          : "vertical",
            width           : (window.CONFIG.debug && window.CONFIG.screen) ? window.CONFIG.screen.width : null,
            height           : (window.CONFIG.debug && window.CONFIG.screen) ? (window.CONFIG.screen.height - 95) : null,
            scrollIndicator : "none"
        },
        itemViewStyle =
        {
            top             : "0",
            bottom          : "51px",
            bounce          : "vertical",
            width           : (window.CONFIG.debug && window.CONFIG.screen) ? window.CONFIG.screen.width : null,
            height           : (window.CONFIG.debug && window.CONFIG.screen) ? (window.CONFIG.screen.height - 51) : null,
            scrollIndicator : "none"
        },
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
        if(window.user.name)
        {
            options.name = window.user.name;
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
                scrollIndicator : "none",
                width           : (window.CONFIG.debug && window.CONFIG.screen) ? window.CONFIG.screen.width : null,
                height          : (window.CONFIG.debug && window.CONFIG.screen) ? (window.CONFIG.screen.height) : null,
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

        if(lastListView)
        {
            window.fire(lastListView, 'closeDialog', {aniClose: 'fade-out'});

            if(currentListView === options.name)
            {
                window.fire(lastListView, 'reloadData', options);
                return;
            }

            lastListView.hide('fade-out', animateSpeed);
        }

        if(typeof listViews[options.name] === 'string')
        {
            var view = listViews[options.name] = plus.webview.create(listViews[options.name], options.name, listViewStyle);

            showWaiting();
            setTimeout(function()
            {
                mainView.append(view);
                hideWaiting();
            }, 500);
        }
        else
        {
            listViews[options.name].show('fade-in', animateSpeed);
            window.fire(listViews[options.name], 'reloadData');
        }

        document.getElementsByClassName('open-listview').forEach(function(el)
        {
            el.classList[el.getAttribute('data-id') === options.name ? 'add' : 'remove']('active');
        });

        currentListView = options.name;
        window.userStore.set('lastListView', currentListView);
    };

    var closeItemView = function()
    {
        if(itemView)
        {
            itemView.close();
            itemView = null;
        }
    };

    var openItemView = function(options, id)
    {
        if(typeof options === 'string'){options = {type: options, id: id};}

        closeItemView();

        var item = options.item || zentao.datalist.getById(options.type, options.id);
        if(!item)
        {
            window.plus.nativeUI.toast('无法找到该项目。');
            return;
        }

        var needSync = options.needSync || !item._DETAIL || ((new Date()).getTime() - item.syncTime.getTime()) > Date.ONEDAY_TICKS;

        itemView = window.openWindow(
        {
            url: options.type + ".html",
            id: options.type + "-" + options.id,
            styles: itemViewStyle,
            aniType: 'slide-in-right',
            extras:
            {
                options: {id: options.id, type: options.type, data: item, url: window.user.url, wait: needSync}
            }
        });

        if(needSync)
        {
            setTimeout(function()
            {
                zentao.loadItem(options.type, options.id, function(newItem)
                {
                    window.fire(itemView, 'refresh', {id: options.id, type: options.type, data: newItem, wait: false});
                }, function()
                {
                    window.fire(itemView, 'overwait');
                });
            }, 300);
        }
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

        var oldUser = window.user.account;
        zentao.login(key, function()
        {
            if(withUi)
            {
                window.fire(loginWindow, 'logged', {result: true});
                if(oldUser != key.account)
                {
                    openListView();
                }
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
        zentao.logout(false, function()
        {
            updateBadge();
            for(var list in listViews)
            {
                var view = listViews[list];
                if(typeof view === 'object')
                {
                    window.fire(view, 'reloadData');
                }
            }
            checkStatus();
        });
    };

    var checkStatus = function()
    {
        var status = window.user ? window.user.status : 'logout';

        // console.color('CHECKSTATUS:' + status, 'h5|bgwarning');

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
                if(window.user.status === 'online') $statusName.classList.add('hide-name');
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
        // console.color('RUNNING IN FRONT', 'bgsuccess');
    };

    var onPause = function()
    {
        zentao.runningInBackground = true;
        // console.color('RUNNING IN BACKGROUND', 'bgdanger');
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
        // console.color('NET CHANGE:' + network, "h3|bgdanger");

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
        zentao.loadData(function(/*datalist*/) {
            updateBadge();
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

    var updateListBadge = function(list, unreadCount)
    {
        // console.log('updateListBadge', list, unreadCount);
        if(!unreadCount)
        {
            unreadCount = zentao.datalist.getUnreadCount(list);
        }

        var $listNav = document.$id('tab-' + list);
        $listNav.classList[unreadCount > 0 ? 'add' : 'remove']('unread');
        $listNav.$('.unread-count').innerHTML = unreadCount < 100 ? unreadCount : '99+';

        if(!markReadTip && unreadCount > 10)
        {
            window.plus.nativeUI.toast('下拉来标记所有条目已读');
            markReadTip = true;
        }
    };

    var updateBadge = function(unreadCount)
    {
        if(!unreadCount)
        {
            unreadCount = zentao.datalist.getUnreadCount();
        }
        for(var list in unreadCount)
        {
            if(list !== 'total') updateListBadge(list, unreadCount[list]);
        }
    };

    var markRead = function(tab, id)
    {
        zentao.datalist.markRead(tab, id);
        updateListBadge(tab);
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
                scrollIndicator : "none",
                width           : (window.CONFIG.debug && window.CONFIG.screen) ? window.CONFIG.screen.width : null,
                height          : (window.CONFIG.debug && window.CONFIG.screen) ? (window.CONFIG.screen.height) : null,
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
          .on('openItemView', function(e){openItemView(e.detail);})
          .on('closeItemView', closeItemView)
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
    }).on('logged', function(/*result*/)
    {
        // console.color('logged: ' + result, 'h4|bg' + (result ? 'success' : 'danger'));
        isLoging = false;
        checkStatus();
        firstSync = true;
        zentao.sync();
    }).on('syncing', function()
    {
        // startSync();
    }).on('sync', function(e)
    {
        if(e.result)
        {
            // console.color('SYNC>>> ', 'h5|bginfo');
            updateBadge(e.unreadCount);
            var newItems = e.newItems;

            if(firstSync || newItems[currentListView] && newItems[currentListView].length > 0)
            {
                // console.log(firstSync, currentListView, e.unreadCount, listViews[currentListView]);
                window.fire(listViews[currentListView], 'reloadData');
                firstSync = false;
            }

            if(receiveNotify && zentao.runningInBackground)
            {
                lastPush = null;
                plus.runtime.setBadgeNumber(newItems.total);

                if(newItems.total)
                {
                    var message;
                    if(newItems.total > 1)
                    {
                        message = '收到' + newItems.total + '个新的条目';
                    }
                    else if(newItems.total === 1)
                    {
                        lastPush = newItems.latest;
                        message = '新的' + zentao.dataTabs[newItems.latest.dataType].name + ": " + (newItems.latest.name || newItems.latest.title);
                    }
                    plus.push.createMessage(message, "LocalMSG", {cover: true});
                    // console.color('消息已推送：' + message, 'h3|info');
                }
            }

            lastSyncTime = new Date().getTime();
        }
        stopSync();
    }).on('ready', function()
    {
        openListView({offline: true});
        updateBadge();

        if(window.userStore.get('autoSync', true))
        {
            zentao.startAutoSync(syncInterval);
        }

        receiveNotify = window.userStore.get('receiveNotify', receiveNotify);
        syncInterval = window.userStore.get('syncInterval', syncInterval);
    });

    window.plusReady(function()
    {
        mainView = plus.webview.currentWebview();

        window.plus.navigator.setStatusBarBackground( "#FAFAFA" );

        setTimeout(function(){plus.navigator.closeSplashscreen();}, 200);
        
        if(window.CONFIG.debug && window.CONFIG.screen)
        {
            var sc = window.CONFIG.screen;
            mainView.setStyle({width: sc.width, height: sc.height, left: 0, top: 0, right: 'auto'});
        }
        
        if(window.user.status === 'online') window.user.status = 'offline';
        checkStatus();
        if(window.user.status != 'logout') tryLogin();

        document.addEventListener('netchange', onNetChange, false);
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);

        plus.push.addEventListener('click', function(/*msg*/)
        {
            if(lastPush)
            {
                window.fire(listViews[lastPush.dataType], 'showItem', lastPush.id);
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

        // console.color('app plus ready', 'bgsuccess');
    });
}());
