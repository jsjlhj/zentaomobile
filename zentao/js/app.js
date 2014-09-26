(function(mui, $)
{
    var $content        = $('#content'),
        animateSpeed    = 200,
        windows         = {todo: "todos.html", task: "tasks.html", bug: "bugs.html", story: "stories.html"},
        mainView,
        currentSub,
        subTabs         = {todo: 1, task: 2, bug: 3, story: 4},
        defaultTab,
        firstBackbutton = null,
        loginWindow,
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
        mainView = plus.webview.currentWebview();
        document.getElementById('subpageNav').addDelegateListener('tap', '.open-subpage', function()
        {
            openSubWin(this.getAttribute('data-id'));
        });

        console.color('app plus ready', 'bgsuccess');
    });

    var $status     = $('#userStatus'),
        $statusName = $('#userStatusName'),
        $settingBtn = $('#settingBtn');
    zentao.on('logging', function()
    {
        $statusName.innerHTML = '登录中...';
        $status.setAttribute('data-status', 'logging');
    }).on('logged', function(result)
    {
        checkUserStatus();
        openSubWin();
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
        settingWindow = plus.webview.create('setting.html', 'setting', 
        {
            top: "0px",
            bottom: "0px",
            bounce: "vertical",
            scrollIndicator: "none"
        });
        settingWindow.addEventListener('close', checkUserStatus);
        settingWindow.show('slide-in-right', 200);
    });

    zentao.ready(function()
    {
        checkUserStatus('mild', true);
    });

    function checkUserStatus(mild, first)
    {
        var md = mild === 'mild';
        var user = md ? window.user : window.storage.getUser();
        var status = user.status;

        $status.classList.remove('hide-name');
        if(!user || user.status === 'logout')
        {
            $statusName.innerHTML = '请登录';
            $settingBtn.classList.add('mui-hidden');
            status = 'offline';
            openLoginWindow();
        }
        else if(first)
        {
            user.status = 'offline';
            status = 'offline';
            $statusName.innerHTML = '离线';
            if(md) zentao.login();
            $settingBtn.classList.remove('mui-hidden');
        }
        else if(user.status === 'online')
        {
            $statusName.innerHTML = '在线';
            status = 'online';
            setTimeout(function(){$status.classList.add('hide-name');}, 2000);
            openSubWin();
            $settingBtn.classList.remove('mui-hidden');
        }
        else
        {
            $statusName.innerHTML = '离线';
            status = 'offline';
            if(md) zentao.login();
            $settingBtn.classList.remove('mui-hidden');
        }
        $status.setAttribute('data-status', status);
    }

    function openLoginWindow()
    {
        loginWindow = plus.webview.create('login.html', 'login', 
        {
            top: "0px",
            bottom: "0px",
            bounce: "vertical",
            scrollIndicator: "none"
        });
        loginWindow.addEventListener('close', checkUserStatus);
        loginWindow.show('zoom-in', 200);
    }

    function openSubWin(list)
    {
        if(!defaultTab)
        {
            defaultTab = window.storage.get('lastTab', 'todo');
        }

        list = list || currentSub || defaultTab;
        var currentWin = windows[currentSub];

        if(currentWin && currentSub === list)
        {
            currentWin.evalJS('reload();');
            return;
        }

        if(currentWin)
        {
            currentWin.hide(subTabs[list] < subTabs[currentSub] ? 'slide-out-right' : 'slide-out-left', animateSpeed);
            var openeds = currentWin.opened();
            openeds.forEach(function(opendedDialog)
            {
                if(opendedDialog.dialogOptions)
                {
                    opendedDialog.hide('zoom-out', 100);
                }
            });
        }
        if(typeof windows[list] === 'string')
        {
            windows[list] = plus.webview.create(windows[list], list, 
            {
                top: "44px",
                bottom: "0px",
                bounce: "vertical",
                scrollIndicator: "none"
            });

            mainView.append(windows[list]);
        }
        else
        {
            windows[list].show(subTabs[list] > subTabs[currentSub] ? 'slide-in-right' : 'slide-in-left', animateSpeed);
        }

        $('.open-subpage').forEach(function(el)
        {
            el.classList[el.getAttribute('data-id') === list ? 'add' : 'remove']('mui-active');
        });

        currentSub = list;
        window.storage.set('lastTab', currentSub);
    }

    function switchOutContent(from, to, animation)
    {
        if (typeof animation === 'undefined') animation = 'zoom';
        if (typeof from === 'string') from = $('#' + from);
        if (typeof to === 'string') to = $('#' + to);
        from.classList.add(animation + '-out');
        if (to) to.classList.add('show');
        $content.classList.add('switching');
        setTimeout(function()
        {
            from.classList.remove('show');
            $content.classList.remove('switching');
        }, animateSpeed);
    }
})(mui, $);
