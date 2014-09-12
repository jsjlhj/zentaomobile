(function(mui, $)
{
    var $content        = $('#content'),
        animateSpeed    = 200,
        windows         = {todo: "todos.html", task: "tasks.html", bug: "bugs.html", story: "stories.html"},
        mainView,
        currentSub,
        subTabs         = {todo: 1, task: 2, bug: 3, story: 4},
        defaultTab      = 'story',
        firstBackbutton = null,
        loginWindow;

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

    var $status = $('#userStatus');
    zentao.on('logging', function()
    {
        $status.innerHTML = '登录中...';
    }).on('logged', function(result)
    {
        if(result)
        {
            $status.innerHTML = '在线';
        }
        else
        {
            $status.innerHTML = '登录失败';
            openLoginWindow();
        }
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

    zentao.ready(function()
    {
        var user = window.user;

        if(!user || user.status === 'logout')
        {
            $status.innerHTML = '请登录';
            openLoginWindow();
        }
        else
        {
            $status.innerHTML = '离线';
            zentao.login();
        }
    });

    function openLoginWindow()
    {
        if(!loginWindow)
        {
            loginWindow = plus.webview.create('login.html', 'login', 
            {
                top: "0px",
                bottom: "0px",
                bounce: "vertical",
                scrollIndicator: "none"
            });
        }
        loginWindow.show('zoom-in', 200);
    }

    function openSubWin(list)
    {
        list = list || defaultTab;
        var currentWin = windows[currentSub];

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
