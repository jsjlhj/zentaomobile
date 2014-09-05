(function(mui, $)
{
    var $content = $('#content');
    var animateSpeed = 300;

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
        var username = $('#username');
        var password = $('#password');
        var pwdMd5;
        var address  = $('#address');
        var loginBtn = $('#loginBtn');
        var tryLogin = function(silence)
        {
            console.log('尝试登录');
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

            console.log(user);

            zentao.login(user, function()
            {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '登录';
                switchOutContent('login', 'list');
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

    function switchOutContent(from, to, animation)
    {
        if(typeof animation === 'undefined') animation = 'zoom';
        if(typeof from === 'string') from = $('#' + from);
        if(typeof to === 'string') to = $('#' + to);
        from.classList.add(animation + '-out');
        to.classList.add('show');
        $content.classList.add('switching');
        setTimeout(function()
        {
            from.classList.remove('show');
            $content.classList.remove('switching');
        }, animateSpeed);
    }
})(mui, $);
