(function(mui, $)
{
    var $content        = $('#content'),
        animateSpeed    = 200,
        windows         = {todo: "todos.html", task: "tasks.html", bug: "bugs.html", story: "stories.html"},
        mainView,
        currentSub,
        subTabs         = {todo: 1, task: 2, bug: 3, story: 4},
        defaultTab      = 'story',
        firstBackbutton = null;

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

    mui.ready(function()
    {
    });

    mui.plusReady(function()
    {
        mainView = plus.webview.currentWebview();
        handleLoginView();

        handleSubpageNav();
        console.color('app plus ready', 'bgsuccess');
    });

    function handleSubpageNav()
    {
        document.getElementById('subpageNav').addDelegateListener('tap', '.open-subpage', function()
        {
            openSubWin(this.getAttribute('data-id'));
        });
    };

    function handleLoginView()
    {
        var user = window.user;
        var username = $('#username');
        var password = $('#password');
        var pwdMd5;
        var address = $('#address');
        var loginBtn = $('#loginBtn');
        var tryLogin = function(silence)
        {
            if (!silence)
            {
                if (address.value === '')
                {
                    alert('请输入禅道地址，包含“http://”。');
                    return;
                }
                else if (username.value === '')
                {
                    alert('请输入用户名或者注册邮箱。');
                    return;
                }
                else if (password.value === '')
                {
                    alert('请输入密码。');
                    return;
                }
            }

            if (silence && (user.url || user.account || user.pwdMd5 || 1) === 1)
            {
                return;
            }

            loginBtn.disabled = 'disabled';
            loginBtn.innerHTML = '正在登录...';

            if (!silence)
            {
                user.account = username.value;
                user.pwdMd5 = window.md5(password.value);
                user.url = address.value;
            }

            zentao.login(user, function()
            {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '登录';
                switchOutContent('login', 'list');
                consolelog('登录成功。', 'bgsuccess|h5');

                openSubWin();
            }, function(response)
            {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '登录';
                if (!silence) alert('登录失败。' + (response ? response.message : ''));
            });

            return false;
        };

        if (user.account) username.value = user.account;
        if (user.url) address.value = user.url;

        address.on('focus', function()
        {
            if (address.value === '')
            {
                address.value = 'http://';
            }
        }).on('blur', function()
        {
            if (address.value === 'http://')
            {
                address.value = '';
            }
        });

        $('#loginBtn').on('click', function()
        {
            tryLogin(false);
        });

        tryLogin(true);
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
