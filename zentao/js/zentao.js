/* Zentao API */
+function($)
{
    "use strict";

    var store = window.store;
    var md5   = window.md5;
    var dataTypeSet = ',todo,task,bug,story,';

    function storeSet(key, value, ignoreAccount)
    {
        if(ignoreAccount)
        {
            store.set(key, value);
        }
        else if(user && user.account)
        {
            store.set(user.account + '::' + key, value);
        }
        else
        {
            console.error('存储失败！无法获取用户数据。');
        }
    }

    function storeGet(key, defaultValue, ignoreAccount)
    {
        if(ignoreAccount)
        {
            return store.get(key, defaultValue);
        }
        else if(user && user.account)
        {
            return store.get(user.account + '::' + key, defaultValue);
        }
        else
        {
            console.error('获取存储数据失败！无法获取用户数据。');
        }
    }

    function getUser()
    {
        var account = store.get('account', '');
        if(account !== '')
        {
            window.user = store.get('userlist', {})[account];
        }
        else
        {
            window.user = {};
        }
        console.groupCollapsed('%cUSER: ' + user.account + '@' + user.url, 'color: orange; border-left: 10px solid orange; padding-left: 5px;font-size: 16px; font-weight: bold;');
        console.log(user);
        console.groupEnd();
    }

    function saveUser()
    {
        var user = window.user;
        if(user && user.account)
        {
            store.set('account', user.account);
            var userlist = store.get('userlist', {});
            userlist[user.account] = user;
            store.set('userlist', userlist);
        }
        else
        {
            console.error('存储失败！无法获取用户数据。');
        }
    }

    var DataList = function(name, data)
    {
        this.name = name;
        var storeData = storeGet('datalist::' + this.name, {data: [], updateTime: new Date(0)});
        this.data = storeData.data;
        this.updateTime = storeData.updateTime;
        if(typeof this.updateTime === 'string')
        {
            this.updateTime = new Date(Date.parse(this.updateTime));
        }
        this.account = window.user['account'];
        this.clean();
        if(data)
        {
            this.load(data);
        }
    };

    DataList.prototype.clean = function(objOrArray)
    {
        objOrArray = objOrArray || this.data;

        if(Array.isArray(objOrArray))
        {
            this.each(function(index, obj)
            {
                obj = this.clean(obj);
            }, objOrArray);
            return objOrArray;
        }
        else
        {
            if(typeof objOrArray['id'] === 'string')
            {
                objOrArray['id'] = parseInt(objOrArray['id']);
            }
            if(typeof objOrArray['pri'] === 'string')
            {
                objOrArray['pri'] = parseInt(objOrArray['pri']);
            }
            if(typeof objOrArray['date'] === 'string')
            {
                objOrArray['date'] = new Date(Date.parse(objOrArray['date']));
            }
            return objOrArray;
        }
    };

    DataList.prototype.save = function()
    {
        storeSet('datalist::' + this.name, {data: this.data, updateTime: this.updateTime});
    };

    DataList.prototype.getById = function(id)
    {
        var result = null;
        if(typeof id === 'string')
        {
            id = parseInt(id);
        }
        if(typeof id === 'number')
        {
            this.each(function(index, obj)
            {
                if(obj.id === id)
                {
                    result = obj;
                    return false;
                }
            });
        }
        else
        {
            console.error('Id必须是数字。');
        }
        return result;
    };

    DataList.prototype.has = function(idOrObj)
    {
        var obj = null;
        if(typeof idOrObj === 'object')
        {
            obj = this.getById(idOrObj.id);
        }
        else
        {
            obj = this.getById(idOrObj);
        }
        return obj !== null;
    };

    DataList.prototype.each = function(fn, data)
    {
        data = data || this.data;
        var result;
        for (var i = 0; i < data.length; ++i)
        {
            result = fn.call(this, i, data[i]);
            if(result === false)
            {
                break;
            }
        };
    };

    DataList.prototype.load = function(data)
    {
        var dt = this.data,
            dObj;
        this.updateTime = new Date();
        if(this.account != data.account)
        {
            console.error('所获取的数据与当前帐号不匹配。');
            return false;
        }

        data = data[this.name ] || data[this.name + 's'];

        this.each(function(index, obj)
        {
            obj = this.clean(obj);
            dObj = this.getById(obj.id);
            if(dObj === null)
            {
                dt.push(obj);
            }
            else
            {
                dObj = obj;
            }
        }, data);

        this.sort();
        this.save();
    };

    DataList.prototype.sort = function(fn)
    {
        this.data.sort(fn || function(a, b)
        {
            return b.id - a.id;
        });
    };

    var Zentao = function()
    {
        var that = this;
        this.isReady = false;
        that.readyFns = [];

        $.plusReady(function()
        {
            console.color('Zentao Ready.', 'bgsuccess');
            console.log('that.readyFns.length', that.readyFns.length);

            getUser();
            that.data =
            {
                todo: new DataList('todo'),
                task: new DataList('task'),
                bug: new DataList('bug'),
                story: new DataList('story')
            };

            that.config = storeGet('zentaoConfig', {});
            that.session = storeGet('session', {});
            setTimeout(function(){that.ready()}, 100);
        });
    };

    Zentao.prototype.ready = function(fn)
    {
        if(typeof fn === 'function')
        {
            this.readyFns.push(fn);
        }
        else
        {
            for (var i = 0; i < this.readyFns.length; ++i)
            {
                this.readyFns[i]();
            };
        }
        this.isReady = true;
    };

    /* Get zentao config and login in zentao */
    Zentao.prototype.login = function(loginkey, successCallback, errorCallback)
    {
        var that = this;
        if(loginkey)
        {
            window.user.url     = loginkey.url;
            window.user.account = loginkey.account;
            window.user.pwdMd5  = loginkey.pwdMd5;
        }

        this.getConfig(function()
        {
            var checkVer = that.checkVersion();
            if(!checkVer.result)
            {
                that.callWidthMessage(errorCallback, checkVer.message);
                return;
            }

            consolelog('1.成功获取配置。', 'success');
            that.getSession(function()
            {
                consolelog('2.成功获取Session。', 'success');
                that.tryLogin(function()
                {
                    consolelog('3.成功登陆。', 'success');
                    that.getRole(function()
                    {
                        consolelog('4.成功获取角色。', 'success');
                        storeSet('lastLoginTime', new Date());
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
        var url         = window.user.url,
            user        = window.user,
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
                var password = md5(window.user.pwdMd5 + session.rand);
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

                url += 'recTotal=' + params.recTotal + '&recPerPage=' + params.recPerPage + '&pageID=' + params.pageID;
            }

            url += '&t=' + viewType;

            if(session && moduleName !== 'api' && methodName.toLowerCase() !== 'getsessionid')
            {
                url += '&' + session.sessionName + '=' + session.sessionID;
            }
        }
        else
        {
            url += '/';
            if(moduleName === 'user' && methodName === 'login')
            {
                var password = md5(window.user.pwdMd5 + session.rand);
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

                url += params.recTotal + '-' + params.recPerPage + '-' + params.pageID;
            }

            if(url.lastIndexOf('-') === (url.length - 1))
            {
                url = url.substr(0, url.length -1);
            }

            url += '.' + viewType;

            if(session && moduleName !== 'api' && methodName.toLowerCase() !== 'getsessionid')
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
                    storeSet('session', session);
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
        var url = this.concatUrl({module: 'api', method: 'getmodel', moduleName: 'user', methodName: 'getById', account: window.user.account}),
            that = this;
        $.get(url, function(response)
        {
            var roleData = JSON.parse(response);
            if(roleData['status'] !== 'failed')
            {
                roleData = JSON.parse(roleData.data);
                window.user.role = roleData.role;
                saveUser();
                window.user.data = roleData;
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
        $.get(window.user.url  + '/index.php?mode=getconfig', function(response)
        {
            var config = JSON.parse(response);
            if(config.version)
            {
                that.config = config;
                storeSet('zentaoConfig', config);
                successCallback && successCallback(config);
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取配置信息不正确，请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。');
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

    Zentao.prototype.getData = function(dataType, start, count)
    {
        if(typeof start === 'undefined') start = new Date();
        if(typeof count === 'undefined') count = 10;
        else if(count === 'all') count = 999999;

        console.color('GetData: ' + dataType + ',' + start + ',' + count, 'h4|info');

        if(typeof dataType === 'undefined' || dataTypeSet.indexOf(',' + dataType + ',') < 0)
        {
            console.error('无法检索数据，因为没有指定DataType或者指定的dataType不受支持。');
            return false;
        }

        var type = 'unkown';
        if(typeof start === 'number')
        {
            type = 'id';
        }
        else if(start instanceof Date)
        {
            type = 'date';
        }
        else if(start && start.id)
        {
            type = 'id';
            start = start.id;
        }
        else if(typeof start === 'function')
        {
            type = 'function';
        }
        else
        {
            console.error('无法检索数据，因为没有指定start边界不是数字或日期。');
            return false;
        }

        var data = this.data[dataType],
            result = [],
            thisCount = 0;
        if(type === 'function')
        {
            data.each(function(index, obj)
            {
                if(start(obj))
                {
                    result.push(obj);
                }
                if((++thisCount) >= count) return false;
            });
        }
        else
        {
            data.each(function(index, obj)
            {
                if(obj[type] < start)
                {
                    result.push(obj);
                }
                if((++thisCount) >= count) return false;
            });
        }

        return result;
    };

    Zentao.prototype.filterData = function(dataType, filter)
    {
        console.color('FilterData: ' + dataType + ',' + filter, 'h4|info');

        var result = [], data = this.data[dataType];
        if(!data) return false;

        if(dataType === 'todo')
        {
            if(filter === 'today')
            {
                var today = Date.parseName('today');
                data.each(function(idx, val)
                {
                    if(val.date >= today)
                    {
                        result.push(val);
                    }
                });
            }
            else if(filter === 'yestoday')
            {
                var today = Date.parseName('today');
                var yestoday = today.clone().addDays(-1);
                data.each(function(idx, val)
                {
                    if(val.date >= yestoday && val.date < today)
                    {
                        result.push(val);
                    }
                });
            }
            else if(filter === 'thisweek')
            {
                var thisweek = Date.parseName('thisweek');
                data.each(function(idx, val)
                {
                    if(val.date >= thisweek)
                    {
                        result.push(val);
                    }
                });
            }
            else if(filter === 'thisweek')
            {
                var thisweek = Date.parseName('thisweek');
                var lastweek = thisweek.clone().addDays(-7);
                data.each(function(idx, val)
                {
                    if(val.date >= lastweek && val.date < thisweek)
                    {
                        result.push(val);
                    }
                });
            }
        }

        console.log('FilterData:', result);
        return result;
    };

    Zentao.prototype.loadData = function(dataType, successCallback, errorCallback, count)
    {
        console.color('LoadData: ' + dataType, 'h4|info');

        if(typeof dataType === 'undefined' || dataTypeSet.indexOf(',' + dataType + ',') < 0)
        {
            this.callWidthMessage(errorCallback, '无法加载数据，因为没有指定DataType或者指定的dataType不受支持。');
            return false;
        }

        if(typeof count === 'undefined')
        {
            var data = this.data[dataType];
            if(data.data.length < 1)
            {
                count = 1000;
            }
            else
            {
                var pastTime = ((new Date()).getTime() - data.updateTime.getTime())/60000; // 分钟为单位
                count = Math.max(1000, Math.min(20, Math.floor(pastTime * 0.5)));
            }
        }
        var that = this,
            url = this.concatUrl({module: 'my', method: dataType, type: 'all', pageID: 1, recTotal: 1000, recPerPage: 1000});

        $.get(url, function(response)
        {
            var dt = JSON.parse(response);
            if(dt['status'] === 'success')
            {
                dt = JSON.parse(dt.data);
                that.data[dataType].load(dt);
                successCallback && successCallback(dt);
            }
            else
            {
                that.callWidthMessage(errorCallback, '无法获取用户数据，请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。')
            }

        }, that.fnToCallWidthMessage(errorCallback, '无法获取数据，请检查网络。'));
    }

    window.zentao = new Zentao();
}(mui);
