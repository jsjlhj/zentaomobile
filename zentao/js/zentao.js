/* Zentao API */
(function()
{
    "use strict";

    var dataTabs =
    {
        todo: {name: '待办', syncId: 0, subsSet: ['today', 'yestoday', 'thisweek', 'undone']},
        task: {name: '任务', syncId: 0, subsSet: ['assignedTo', 'openedBy', 'finishedBy']},
        bug: {name: 'Bug', syncId: 0, subsSet: ['assignedTo', 'openedBy', 'resolvedBy']},
        story: {name: '需求', syncId: 0, subsSet: ['assignedTo', 'openedBy', 'reviewedBy']}
    };
    var dataTabsSet = ['todo', 'task', 'bug', 'story'];

    var Zentao = function()
    {
        var that = this;
        this.isReady = false;
        this.syncId = 0;
        this.eventDrawer = new EventDrawer();
        this.dataTabs = dataTabs;
        this.dataTabsSet = dataTabsSet;

        window.plusReady(function()
        {
            // console.color('zentao ready', 'h5|bgsuccess');
            window.userStore.init();

            that.datalist = new DataList(dataTabsSet);

            setTimeout(function()
            {
                that.isReady = true;
                that.trigger('ready');
            }, 150);
        });
    };

    Zentao.prototype.hasTab = function(tab)
    {
        dataTabsSet.forEach(function(val)
        {
            if(tab === val) return true;
            
        });
        return false;
    };

    // Zentao.prototype.unreadCount = function(tab)
    // {
    //     if(tab) return this.data[tab].getUnreadCount();

    //     var count = 0;
    //     for(var t in this.data)
    //     {
    //         count += this.data[t].getUnreadCount();
    //     }
    //     return count;
    // };

    Zentao.prototype.on = function(e, fn)
    {
        // console.color("ZENTAO ON: " + e, 'h5|bgwarning');
        this.eventDrawer.on(e, fn);

        if(e === 'ready' && this.isReady) this.trigger(e);
        return this;
    };

    Zentao.prototype.off = function(e)
    {
        this.eventDrawer.off(e);

        return this;
    };

    Zentao.prototype.trigger = function(e, pramas)
    {
        // console.color("ZENTAO TRIGGER: " + e, 'h5|bgwarning');
        
        this.eventDrawer.trigger(e, pramas, this);

        return this;
    };

    Zentao.prototype.ready = function(fn)
    {
        this.on('ready', fn);
    };

    Zentao.prototype.logout = function(clean, callback)
    {
        var that = this;
        var afterLogout = function()
        {
            if(clean)
            {
                window.userStore.clearUser();
            }
            else
            {
                window.userStore.saveUser({status: 'logout', pwdMd5: null});
            }

            that.datalist.empty();

            callback && callback(clean);
        };

        http.get(this.concatUrl({module: 'user', method: 'logout'}), afterLogout, afterLogout);
    };

    /* Get zentao config and login in zentao */
    Zentao.prototype.login = function(loginkey, successCallback, errorCallback)
    {
        var callError = function(message)
        {
            if(window.user.status === 'online')
            {
                window.userStore.saveUser({status: 'offline'});
            }
            that.trigger('logged', false);
            errorCallback && errorCallback(message);
        };

        if(this.trigger('logging') === false)
        {
            callError('登录被取消。');
            return;
        }

        var that = this;
        if (loginkey)
        {
            // console.log(loginkey.url);
            // console.log(loginkey.url.startWith('http://'));
            if(!loginkey.url.startWith('http://') && !loginkey.url.startWith('https://'))
            {
                loginkey.url = 'http://' + loginkey.url;
            }

            loginkey.account = loginkey.name + '@' + loginkey.url;

            Object.extend(window.user, loginkey);
            window.userStore.saveUser(window.user);
        }

        if(!window.user.url || !window.user.name || !window.user.pwdMd5)
        {
            callError('用户登录信息不完整。');
            return;
        }

        this.getConfig(function()
        {
            var checkVer = that.checkVersion();
            if (!checkVer.result)
            {
                that.callWidthMessage(callError, checkVer.message);
                return;
            }

            // consolelog('1.成功获取配置。', 'success');
            // that.getSession(function()
            // {
                // consolelog('2.成功获取Session。', 'success');
                that.tryLogin(function()
                {
                    // consolelog('3.成功登陆。', 'success');
                    // that.getRole(function()
                    // {
                        // consolelog('4.成功获取角色。', 'success');
                        successCallback && successCallback();
                        that.trigger('logged', true);
                    // }, that.fnToCallWidthMessage(callError, '在登录时无法获取角色。'));
                }, that.fnToCallWidthMessage(callError));
            // }, that.fnToCallWidthMessage(callError, '在登录时获取Session失败。'));
        }, that.fnToCallWidthMessage(callError, '在登录时获取禅道配置失败。'));
    };

    Zentao.prototype.tryLogin = function(successCallback, errorCallback)
    {
        var url = this.concatUrl(
            {
                module: 'user',
                method: 'login'
            }),
            that = this;
        http.getJSON(url, function(result)
        {
            if (result.status === 'failed')
            {
                that.callWidthMessage(errorCallback, result.reason || '登录失败，所提供的用户名和密码不正确。');
            }
            else if (result.status === 'success')
            {
                window.userStore.saveUser(
                {
                    status: 'online',
                    lastLoginTime: new Date().getTime()
                });
                window.user.data = result.user;
                successCallback && successCallback(result);
            }
            else
            {
                that.callWidthMessage(errorCallback, result.reason || '无法登录，请检查禅道地址是否正确，并确保当前网络连接畅通。禅道手机客户端仅支持禅道专业版4.2以上的版本。');
            }
        }, function(xhr)
        {
            if (xhr.status === 0 || xhr.status === 302)
            {
                successCallback && successCallback(xhr);
            }
            else
            {
                that.callWidthMessage(errorCallback, '无法连接到服务器。xrh.status:' + xhr.status + ' -> ' + url + ':' + xhr.responseText);
            }
        });
    };

    Zentao.prototype.concatUrl = function(params)
    {
        var url = window.user.url,
            user = window.user,
            password,
            config = window.user.config,
            viewType = params.viewType || 'json',
            moduleName = params.module,
            methodName = params.method.toLowerCase();

        if (config.requestType.toLowerCase() === 'get')
        {
            url += '/index.php?';
            if (moduleName === 'user' && methodName === 'login')
            {
                password = md5(window.user.pwdMd5 + config.rand);
                url += 'm=user&f=login&account=' + user.name +
                    '&password=' + password + '&' + config.sessionName +
                    '=' + config.sessionID + '&t=json';
                return url;
            }

            url += 'm=' + moduleName + '&f=' + methodName;

            if(moduleName === 'api')
            {
                if(methodName === 'mobilegetlist')
                {
                    url += '&type=' + (params.type || 'full');
                    url += '&object=' + (params.object || 'all');
                    url += '&range=' + (params.range || '0');
                    url += '&last=' + (params.last || '');
                    url += '&records=' + (params.records || '');
                    url += '&format=' + (params.format || 'index');
                    url += '&zip=' + (params.zip || '0');
                }
                else if(methodName === 'mobilegetinfo')
                {
                    url += '&id=' + params.id;
                    url += '&type=' + params.type;
                }
            }

            url += '&t=' + viewType + '&' + config.sessionName + '=' + config.sessionID;
        }
        else
        {
            if(!url.endWith('/')) url += '/';
            if (moduleName === 'user' && methodName === 'login')
            {
                password = md5(window.user.pwdMd5 + config.rand);
                url += 'user-login.json?account=' + user.name + '&password=' + password + '&' + (config.sessionName || 'sid') + '=' + config.sessionID;
                return url;
            }

            url += moduleName + '-' + methodName + '-';

            if(moduleName === 'api')
            {
                if(methodName === 'mobilegetlist')
                {
                    url += (params.type || 'full') + '-';
                    url += (params.object || 'all') + '-';
                    url += (params.range || '0') + '-';
                    url += (params.last || '') + '-';
                    url += (params.records || '1000') + '-';
                    url += (params.format || 'index') + '-';
                    url += (params.zip || '0');
                }
                else if(methodName === 'mobilegetinfo')
                {
                    url += params.id + '-';
                    url += params.type;
                }
            }

            if (url.endWith('-'))
            {
                url = url.substr(0, url.length - 1);
            }

            url += '.' + viewType + '?' + config.sessionName + '=' + config.sessionID;
        }

        return url;
    };

    Zentao.prototype.getConfig = function(successCallback, errorCallback)
    {
        var that = this;
        var url = window.user.url + '/index.php?mode=getconfig';
        http.getJSON(url, function(config)
        {
            // todo: 判断版本号
            if (config.version)
            {
                window.userStore.saveUser({config: config});
                successCallback && successCallback(config);
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取配置信息不正确，请确保所登录的账户拥有超级api权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。');
            }
        }, that.fnToCallWidthMessage(errorCallback, '无法获取禅道配置，请检查禅道地址是否正确。' + url));
    };

    Zentao.prototype.callWidthMessage = function(callback, message, params)
    {
        if(typeof callback === 'function')
        {
            callback && callback(
            {
                message: message
            }, params);
        }
    };

    Zentao.prototype.fnToCallWidthMessage = function(callback, message)
    {
        var that = this;
        var fn = function(params)
        {
            if(typeof params === 'string')
            {
                message += params;
            }
            else if(params && params.message)
            {
                message += params.message;
            }
            that.callWidthMessage(callback, message, params);
        };
        return fn;
    };

    Zentao.prototype.checkVersion = function()
    {
        
        var version = window.user.config.version.toLowerCase();
        var isPro = version.indexOf('pro');

        if (isPro)
        {
            version = version.replace('pro', '');
        }

        var verNum = version.version2Number();
        var result = {
            result: false
        };

        this.isNewVersion = (isPro && verNum > '4.1'.version2Number()) || (!isPro && verNum >= '6.2'.version2Number());

        if (isPro && verNum < '1.3'.version2Number())
        {
            result.message = '你的当前版本是' + version + '，请升级至pro1.3以上';
        }
        else if (!isPro && verNum < '4'.version2Number())
        {
            result.message = '你的当前版本是' + version + '，请升级至4.0以上';
        }
        else
        {
            result.result = true;
        }
        return result;
    };

    // Zentao.prototype.getData = function(dataType, start, count)
    // {
    //     if (typeof start === 'undefined') start = new Date();
    //     if (typeof count === 'undefined') count = 10;
    //     else if (count === 'all') count = 999999;

    //     // console.color('GetData: ' + dataType + ',' + start + ',' + count, 'h4|info');

    //     if (typeof dataType === 'undefined' || this.hasTab(dataType))
    //     {
    //         // console.error('无法检索数据，因为没有指定DataType或者指定的dataType不受支持。');
    //         return false;
    //     }

    //     var type = 'unkown';
    //     if (typeof start === 'number')
    //     {
    //         type = 'id';
    //     }
    //     else if (start instanceof Date)
    //     {
    //         type = 'date';
    //     }
    //     else if (start && start.id)
    //     {
    //         type = 'id';
    //         start = start.id;
    //     }
    //     else if (typeof start === 'function')
    //     {
    //         type = 'function';
    //     }
    //     else
    //     {
    //         // console.error('无法检索数据，因为没有指定start边界不是数字或日期。');
    //         return false;
    //     }

    //     var data = this.data[dataType],
    //         result = [],
    //         thisCount = 0;
    //     if (type === 'function')
    //     {
    //         data.forEach(function(obj)
    //         {
    //             if (start(obj))
    //             {
    //                 result.push(obj);
    //             }
    //             if ((++thisCount) >= count) return false;
    //         });
    //     }
    //     else
    //     {
    //         data.forEach(function(obj)
    //         {
    //             if (obj[type] < start)
    //             {
    //                 result.push(obj);
    //             }
    //             if ((++thisCount) >= count) return false;
    //         });
    //     }

    //     return result;
    // };

    Zentao.prototype.filterData = function(dataType, filter)
    {
        // console.color('FilterData: ' +  dataType + ',' + filter, 'h4|info');

        return this.datalist.filter(dataType, filter);
    };

    Zentao.prototype.loadItem = function(type, id, successCallback, errorCallback)
    {
        var options = 
        {
            module: 'api',
            method: 'mobileGetInfo',
            id: id,
            type: type
        };

        var url = this.concatUrl(options);
        var that = this;
        http.getJSON(url, function(dt)
        {
            if(dt.status === 'success')
            {
                var item = JSON.parse(dt.data);
                item = zentao.datalist.loadItem(type, item);
                successCallback && successCallback(item);
            }
            else
            {
                that.callWidthMessage(errorCallback, '无法获取数据。' + (dt.reason || '') + '请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。');
            }
        }, function()
        {
            errorCallback && errorCallback();
        });
    };

    Zentao.prototype.loadData = function(successCallback, errorCallback)
    {
        if(this.network === 'disconnect')
        {
            this.callWidthMessage(errorCallback, '没有连接网络。');
            return false;
        }

        var currentUser = window.userStore.user;
        if(!currentUser || currentUser.status !== 'online')
        {
            this.callWidthMessage(errorCallback, '请先登录。');
            return false;
        }

        var that = this;
        if(that.syncId === 0 && that.datalist.lastLoadTime)
        {
            that.lastSyncTime = that.datalist.lastLoadTime;
            that.syncId = 2;
        }
        else if(that.syncId < 2)
        {
            that.lastSyncTime = (new Date()).addDays(0-(400 - that.syncId*200));
        }

        var options = 
        {
            module: 'api',
            method: 'mobileGetList',
            format: 'index',
            zip: 1,
            records: 100,
            type: 'increment',
            last: Math.floor(that.lastSyncTime/1000)
        };

        // console.log('SYNC', that.syncId, that.lastSyncTime, options);

        var nextSyncTime = new Date();
        var url = this.concatUrl(options);

        http.getJSON(url, function(dt)
        {
            if (dt.status === 'success')
            {
                var jsonData = dt.data;
                if(dt.zip && dt.zip !== '0')
                {
                    var decodedData = window.decodeB64(jsonData);
                    var inflate = new window.Zlib.Inflate(decodedData);
                    jsonData = String.fromCharCode.apply(null, inflate.decompress());
                }
                dt = JSON.parse(jsonData);
                that.datalist.load(dt);
                that.lastSyncTime = nextSyncTime;
                that.syncId++;
                successCallback && successCallback(dt);
            }
            else
            {
                that.callWidthMessage(errorCallback, '无法获取数据。' + (dt.reason || '') + '请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。');
            }

        }, that.fnToCallWidthMessage(errorCallback, '无法获取数据，请检查网络。'));
    };

    Zentao.prototype.tryLoadData = function(options, successCallback, errorCallback, count)
    {
        if(window.user && window.user.status === 'online')
        {
            this.loadData(successCallback, errorCallback, count);
        }
        else
        {
            var that = this;
            this.login(null, function()
            {
                that.loadData(successCallback, errorCallback, count);
            }, this.fnToCallWidthMessage(errorCallback, '登录失败。'));
        }

        // this.loadData(options, successCallback, errorCallback, count);
    };

    Zentao.prototype.startAutoSync = function(interval, successCallback, errorCallback)
    {
        // interval = 5000;
        this.syncing = interval || window.userStore.get('syncInterval', 20000);
        // console.color('startAutoSync:' + this.syncing, 'h3|bgdanger');
        this.setNextSync(successCallback, errorCallback);
    };

    Zentao.prototype.setNextSync = function(successCallback, errorCallback)
    {
        var that = this;
        setTimeout(function()
        {
            if(!that.syncing) return;
            
            if(http.working || that.network === 'disconnect' || !window.user || window.user.status !== 'online')
            {
                that.setNextSync(successCallback, errorCallback);
                return;
            }

            that.sync(function()
            {
                successCallback && successCallback();
                that.setNextSync(successCallback, errorCallback);
            }, function()
            {
                errorCallback && errorCallback();
                that.setNextSync(successCallback, errorCallback);
            });
        }, that.syncing);
    };

    Zentao.prototype.stopAutoSync = function()
    {
        this.syncing = false;
    };

    Zentao.prototype.restartAutoSync = function(interval, successCallback, errorCallback)
    {
        this.stopAutoSync();
        this.startAutoSync(interval, successCallback, errorCallback);
    };

    Zentao.prototype.sync = function(successCallback, errorCallback)
    {
        var that = this,
            params = {};
        that.trigger('syncing');
        that.loadData(function()
        {
            params.result = true;
            params.unreadCount = that.datalist.getUnreadCount();
            // params.latestItem = that.datalist.latestItem;
            params.newItems = that.datalist.getNewItems();
            successCallback && successCallback(params);
            that.trigger('sync', params);
        }, function(e){
            params.result = false;
            params.e = e;
            errorCallback && errorCallback(params);
            that.trigger('sync', params);
        });
    };

    window.zentao = new Zentao();
}());
