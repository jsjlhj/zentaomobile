/* Zentao API */
+function($)
{
    "use strict";

    var store = window.store;
    var md5 = window.md5;
    var plus = window.plus;

    var Zentao = function()
    {
        this.user = {};
    };

    Zentao.prototype.setPlus = function(pl)
    {
        plus = pl;
    };

    /* Get zentao config and login in zentao */
    Zentao.prototype.login = function(loginkey, successCallback, errorCallback)
    {
        var that = this;
        if(loginkey)
        {
            this.user.url = loginkey.url;
            this.user.account = loginkey.account;
            this.user.pwdMd5 = loginkey.pwdMd5;
        }

        this.getConfig(function()
        {
            var checkVer = that.checkVersion();
            if(!checkVer.result)
            {
                that.callWidthMessage(errorCallback, checkVer.message);
                return;
            }

            console.log('>>> 1.成功获取配置。');
            that.getSession(function()
            {
                console.log('>>> 2.成功获取Session。');
                that.tryLogin(function()
                {
                    console.log('>>> 3.成功登陆。');
                    that.getRole(function()
                    {
                        console.log('>>> 4.成功获取角色。');
                        store.set('lastLoginTime', new Date());
                        successCallback && successCallback();
                    }, errorCallback);
                }, errorCallback);
            }, errorCallback);
        }, errorCallback);
    };

    Zentao.prototype.tryLogin = function(successCallback, errorCallback)
    {
        var url = this.concatUrl({module: 'user', method: 'login'}),
            that = this;
        $.get(url, function(response)
        {
            var status = JSON.parse(response);
            if(status['status'] === 'failed')
            {
                that.callWidthMessage(errorCallback, '登录失败，请检查用户名和密码。');
            }
            else
            {
                successCallback && successCallback(status);
            }
        }, function(xhr)
        {
            if(xhr.status === 0)
            {
                successCallback && successCallback(status);
            }
            else
            {
                that.callWidthMessage(errorCallback, '登录失败。无法连接到服务器。');
            }
        });
    };

    Zentao.prototype.concatUrl = function(params)
    {
        var url         = this.user.url,
            user        = this.user,
            session     = this.session,
            viewType    = params.viewType || 'json',
            moduleName  = params.module,
            methodName  = params.method,
            requestType = (this.config.requestType || 'get').toLowerCase();

        if(requestType === 'get')
        {
            url += '/index.php?';
            if(moduleName === 'user' && methodName === 'login')
            {
                var password = md5(this.user.pwdMd5 + session.rand);
                url += 'm=user&f=login&account=' + user.account +
                '&password=' + password + '&' + session.sessionName +
                '=' + session.sessionID + '&t=json';
                return url;
            }

            url += 'm=' + moduleName + '&f=' + methodName;

            if(moduleName === 'api' && methodName.toLowerCase() === 'getmodel')
            {
                url += '&moduleName=' + params.moduleName + '&methodName=' + params.methodName + '&params=';
                var item;
                var stringSet   = ',viewType,module,method,moduleName,methodName,pageID,type,recTotal,recPerPage,id,';
                for(var i in params)
                {
                    item = params[i];
                    if(stringSet.indexOf(',' + i + ',') > 0) continue;
                    url += i + '=' + item + '&';
                }
            }
            else if(moduleName === 'my')
            {
                url += '&type=' + params.type;
            }
            {
                url += '&' + moduleName +'ID=' + params.id;
            }

            if(params.pageID)
            {
                if(methodName === 'todo')
                {
                    url += '&account=&status=all&orderBy=date_desc,status,begin&';
                }
                else
                {
                    url += '&&orderBy=id_desc&';
                }

                url += 'recTotal=' + params.recTotal + '&recPerPage=' + params.recPerPage + '&pageID=' + pageID;
            }

            url += '&t=' + viewType;

            if(session)
            {
                url += '&' + session.sessionName + '=' + session.sessionID;
            }
        }
        else
        {
            url += '/';
            if(moduleName === 'user' && methodName === 'login')
            {
                console.log('>>>>>>>>>' +session.rand);
                var password = md5(this.user.pwdMd5 + session.rand);
                url += 'user-login.json?account=' + user.account + '&password=' + password + '&' + (session.sessionName || 'sid') + '=' + session.sessionID;
                return url;
            }

            url += moduleName + '-' + methodName + '-';

            if(moduleName === 'api' && methodName.toLowerCase() === 'getmodel')
            {
                url += params.moduleName + '-' + params.methodName + '-';
            }
            else if(moduleName === 'my')
            {
                url += params.type + '-';
            }

            var item;
            var stringSet = ',viewType,module,method,moduleName,methodName,pageID,type,recTotal,recPerPage,';
            for(var i in params)
            {
                item = params[i];
                if(stringSet.indexOf(',' + i + ',') > 0) continue;
                if(methodName !== 'view' || i !== 'id')
                {
                    url += i + '=';
                }
                url += item + '-';
            }

            if(params.pageID)
            {
                if(methodName === 'todo')
                {
                    url += '-all-date_desc,status,begin-';
                }
                else
                {
                    url += 'id_desc-';
                }

                url += params.recTotal + '-' + params.recPerPage + '-' + pageID;
            }

            if(url.lastIndexOf('-') === (url.length - 1))
            {
                url = url.substr(0, url.length -1);
            }

            url += '.' + viewType;

            if(session)
            {
                url += '?' + session.sessionName + '=' + session.sessionID;
            }
        }

        return url;
    };

    Zentao.prototype.getSession = function(successCallback, errorCallback)
    {
        var url = this.concatUrl({module: 'api', method: 'getSessionID'}),
            that = this;
        $.get(url, function(response)
        {
            var session = JSON.parse(response);
            if(session['status'] === 'success')
            {
                session = JSON.parse(session.data);

                if(session.sessionID && session.sessionID != 'undefined')
                {
                    that.session = session;
                    successCallback && successCallback(session);
                }
                else
                {
                    that.callWidthMessage(errorCallback, '获取Session信息不完整。');
                }
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取Session信息失败。');
            }
        }, that.fnToCallWidthMessage(errorCallback, '无法获取Session，请检查禅道地址是否正确。'));
    };

    Zentao.prototype.getRole = function(successCallback, errorCallback)
    {
        var url = this.concatUrl({module: 'api', method: 'getmodel', moduleName: 'user', methodName: 'getById', account: this.user.account}),
            that = this;
        $.get(url, function(response)
        {
            var roleData = JSON.parse(response);
            if(roleData['status'] !== 'failed')
            {
                roleData = JSON.parse(roleData.data);
                that.user.role = roleData.role;
                store.set('user', that.user);
                that.user.data = roleData;
                successCallback && successCallback(roleData);
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取的用户角色信息不完整。');
            }
        }, that.fnToCallWidthMessage(errorCallback, '无法获取用户角色，请检查禅道地址是否正确。'));
    };

    Zentao.prototype.getConfig = function(successCallback, errorCallback)
    {
        var that = this;
        $.get(this.user.url  + '/index.php?mode=getconfig', function(response)
        {
            var config = JSON.parse(response);
            if(config.version)
            {
                that.config = config;
                store.set('zentaoConfig', config);
                successCallback && successCallback(config);
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取配置信息不正确，请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。')
            }
        }, that.fnToCallWidthMessage(errorCallback, '无法获取禅道配置，请检查禅道地址是否正确。'));
    };

    Zentao.prototype.callWidthMessage = function(callback, message)
    {
        callback && callback({message: message});
    };

    Zentao.prototype.fnToCallWidthMessage = function(callback, message)
    {
        var that = this;
        return function(params){that.callWidthMessage(callback, message, params);};
    }

    Zentao.prototype.checkVersion = function()
    {
        var version = this.config.version.toLowerCase();
        var isPro = version.indexOf('pro');

        if(isPro)
        {
            version = version.replace('pro', '');
        }

        var verNum = parseFloat(version);
        var result = {result: false};

        if(isPro && verNum < 1.3)
        {
            result.message = '你的当前版本是' + version + '，请升级至pro1.3以上';
        }
        else if(!isPro && verNum < 4)
        {
            result.message = '你的当前版本是' + version + '，请升级至4.0以上';
        }
        else
        {
            result.result = true;
        }
        return result;
    };

    window.zentao = new Zentao();
}(mui);
