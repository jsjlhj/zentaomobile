(function(mui, $)
{
    var $content = $('#content');
    var animateSpeed = 200;
    var windows = {};
    var mainView;
    var currentSub;
    var subTabs = {todo: 1, bug: 2, task: 3};

    mui.ready(function()
    {
        mui.init(
        {
            swipeBack: false
        });
    });

    mui.plusReady(function()
    {
        mainView = plus.webview.currentWebview();
        windows.todo = plus.webview.create("todos.html", "todo", 
        {
            top: "44px",
            bottom: "0px",
            bounce: "vertical",
            scrollIndicator: "none"
        });

        windows.task = plus.webview.create("tasks.html", "task", 
        {
            top: "44px",
            bottom: "0px",
            bounce: "vertical",
            scrollIndicator: "none"
        });

        windows.bug = plus.webview.create("bugs.html", "bug", 
        {
            top: "44px",
            bottom: "0px",
            bounce: "vertical",
            scrollIndicator: "none"
        });

        handleLoginView();

        handleSubpageNav();
        console.color('app plus ready', 'bgsuccess');
    });

    function handleSubpageNav()
    {
        document.getElementById('subpageNav').addDelegateListener('tap', '.open-subpage', function()
        {
            console.log('handleSubpageNav');
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
        list = list || 'task';

        windows[currentSub] && windows[currentSub].hide(subTabs[list] < subTabs[currentSub] ? 'slide-out-right' : 'slide-out-left', animateSpeed);
        if(!windows[list].parent())
        {
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
