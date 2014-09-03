(function(mui, $)
{
    var zentao = window.zentao;
    var store = window.store;
    var user = store.get('user');
    var plus;

    //全局配置(通常所有页面引用该配置，特殊页面使用mui.init({})来覆盖全局配置)
    mui.initGlobal(
    {
        optimize : true,
        swipeBack : true,
        showAfterLoad : true,
        titleBar : false,
        back: function()
        {
            return
            {
               preload : true
               //TODO 默认启用预加载等show，hide事件，动画都完成后放开预加载
            };
        },
        show: 
        {
            aniShow : 'slide-in-right',
            duration : 400
        }
    });

    // hyperlink
    mui.ready(function()
    {
        console.log('================================================');
        console.log('准备好了！MUI READY.');
        // set plus
        plus = window.plus;
        // store.setPlusStorage(plus);
        zentao.setPlus(plus);

        // bind events
        $('body').on('tap', 'a', function(e)
        {
            var id = this.getAttribute('href');
            if(id && ~id.indexOf('.html'))
            {
                if(window.plus)
                {
                    $.openWindow({
                        id : id,
                        url : this.href,
                        preload : true//TODO 等show，hide事件，动画都完成后放开预加载
                    });
                } else {
                    document.location.href = this.href;
                }
            }
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
            if(address.value === '')
            {
                if(!silence) alert('请输入禅道地址，包含“http://”。');
                return;
            }
            else if(username.value === '')
            {
                if(!silence) alert('请输入用户名或者注册邮箱。');
                return;
            }
            else if(password.value === '')
            {
                if(!silence) alert('请输入密码。');
                return;
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
                alert('登录成功！');
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
                address.value = 'http://zentao.com';
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
})(mui, $);

// toggle
window.addEventListener('toggle', function(event) {
    if (event.target.id === 'M_Toggle') {
        var isActive = event.detail.isActive;
        var table = document.querySelector('.mui-table-view');
        var card = document.querySelector('.mui-card');
        if (isActive) {
            card.appendChild(table);
            card.style.display = '';
        } else {
            var content = document.querySelector('.mui-content');
            content.insertBefore(table, card);
            card.style.display = 'none';
        }
    }
});

//简单处理label点击触发radio或checkbox
window.addEventListener('tap', function(event) {
    var target = event.target;
    for (; target && target !== document; target = target.parentNode) {
        if (target.tagName && target.tagName === 'LABEL') {
            var parent = target.parentNode;
            if (parent.classList && (parent.classList.contains('mui-radio') || parent.classList.contains('mui-checkbox'))) {
                var input = parent.querySelector('input');
                if (input) {
                    input.click();
                }
            }
        }
    }
});
