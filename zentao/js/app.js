(function(mui, $)
{
    var $content = $('#content');
    var animateSpeed = 300;
    var firstShow = true;

    mui.ready(function()
    {
        mui.init({
            swipeBack : false,
            preloadPages: [
            {
                id : 'todos',
                url : 'todos.html',
                styles : {
                    top : '44px',
                    bottom : 0,
                    bounce :'vertical',
                    scrollIndicator : "none"
                }
            },
            {
                id : 'tasks',
                url : 'tasks.html',
                styles : {
                    top : '44px',
                    bottom : 0,
                    bounce :'vertical',
                    scrollIndicator : "none"
                }
            }]
        });

        handleLoginView();
    });

    function handleLoginView()
    {
        var user     = window.user;
        var username = $('#username');
        var password = $('#password');
        var pwdMd5;
        var address  = $('#address');
        var loginBtn = $('#loginBtn');
        var tryLogin = function(silence)
        {
            if(!silence)
            {
                if(address.value === '')
                {
                    alert('请输入禅道地址，包含“http://”。');
                    return;
                }
                else if(username.value === '')
                {
                    alert('请输入用户名或者注册邮箱。');
                    return;
                }
                else if(password.value === '')
                {
                    alert('请输入密码。');
                    return;
                }
            }

            if(silence && (user.url || user.account || user.pwdMd5 || 1) === 1)
            {
                return;
            }

            loginBtn.disabled = 'disabled';
            loginBtn.innerHTML = '正在登录...';

            if(!silence)
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

                openList();
            }, function(response)
            {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '登录';
                if(!silence) alert('登录失败。' + (response ? response.message : ''));
            });
            
            return false;
        };

        if(user.account) username.value = user.account;
        if(user.url) address.value = user.url;

        address.on('focus', function()
        {
            if(address.value === '')
            {
                address.value = 'http://';
            }
        }).on('blur', function()
        {
            if(address.value === 'http://')
            {
                address.value = '';
            }
        });

        $('#loginBtn').on('click', function(){tryLogin(false);});

        tryLogin(true);
    }

    function openList(list)
    {
        list = list || 'todos';

        mui.openWindow(
        {
            id: 'todos',
            show:{
              aniShow: firstShow ? 'none' : 'slide-in-right' //页面显示动画，默认为”slide-in-right“；
            },
            waiting:{
              title:'正在努力加载中...'//等待对话框上显示的提示内容
            }
        });

        firstShow = false;
    }

    function switchOutContent(from, to, animation)
    {
        if(typeof animation === 'undefined') animation = 'zoom';
        if(typeof from === 'string') from = $('#' + from);
        if(typeof to === 'string') to = $('#' + to);
        from.classList.add(animation + '-out');
        if(to) to.classList.add('show');
        $content.classList.add('switching');
        setTimeout(function()
        {
            from.classList.remove('show');
            $content.classList.remove('switching');
        }, animateSpeed);
    }
})(mui, $);
