/* Zentao API */
+ function($)
{
    "use strict";

    var store = window.store;
    var md5 = window.md5;
    var dataTabs =
    {
        todo: {name: '待办'},
        task: {name: '任务'},
        bug: {name: 'Bug'},
        story: {name: '需求'}
    };
    var dataTabsSet = ['todo', 'task', 'bug', 'story'];
    var cleanMaps =
    {
        number: ['id', 'pri', 'storyID', 'projectID', 'storyVersion', 'consumed', 'left', 'estimate', 'severity'],
        date: ['date', 'assignedDate', 'canceledDate', 'closedDate', 'deadline', 'estStarted', 'finishedDate', 'lastEditedDate', 'openedDate', 'realStarted', 'resolvedDate'],
        expand:
        {
            todo:
            {
                status:
                {
                    'wait'      : {name: '未完成', color: 'warning'},
                    'done'      : {name: '已完成', color: 'success'},
                    'doing'     : {name: '进行中', color: 'danger'},
                },
                type:
                {
                    'custom' : '自定义',
                    'bug'    : 'Bug',
                    'task'   : 'task'
                }
            },
            task:
            {
                status:
                {
                  'wait'   : {name: '未开始', color: 'primary'},
                  'doing'  : {name: '进行中', color: 'danger'},
                  'done'   : {name: '已完成', color: 'success'},
                  'pause'  : {name: '已暂停', color: 'warning'},
                  'cancel' : {name: '已取消', color: ''},
                  'closed' : {name: '已关闭', color: ''}
                },
                type:
                {
                    'design'  : '设计',
                    'devel'   : '开发',
                    'test'    : '测试',
                    'study'   : '研究',
                    'discuss' :'讨论',
                    'ui'      : '界面',
                    'affair'  : '事务',
                    'misc'    : '其他'
                }
            },
            bug:
            {
                status:
                {
                    'active'   : {name: '激活',   color: 'danger'},
                    'resolved' : {name: '已解决', color: 'success'},
                    'closed'   : {name: '已关闭', color: ''}
                },
                type:
                {
                    'codeerror'    : '代码错误',
                    'interface'    : '界面优化',
                    'designchange' : '设计变更',
                    'newfeature'   : '新增需求',
                    'designdefect' : '设计缺陷',
                    'config'       : '配置相关',
                    'install'      : '安装部署',
                    'security'     : '安全相关',
                    'performance'  : '性能问题',
                    'standard'     : '标准规范',
                    'automation'   : '测试脚本',
                    'trackthings'  : '事务跟踪',
                    'others'       : '其他'
                }
            },
            story:
            {
                status:
                {
                    'draft'     : {name: '草稿',   color: 'purple'},
                    'active'    : {name: '激活',   color: 'success'},
                    'closed'    : {name: '已关闭', color: ''},
                    'changed'   : {name: '已变更', color: 'danger'}
                },
                stage:
                {
                    'wait'       : '未开始',
                    'planned'    : '已计划',
                    'projected'  : '已立项',
                    'developing' : '研发中',
                    'developed'  : '研发完毕',
                    'testing'    : '测试中',
                    'tested'     : '测试完毕',
                    'verified'   : '已验收',
                    'released'   : '已发布'
                }
            }
        },
        filter:
        {
            todo:
            {
                when: function(obj)
                {
                    var today = new Date(),
                        date  = '';
                    if(obj.date.isSameDay(today))
                    {
                        date = '今天';
                    }
                    else if(obj.date.isSameDay(today.clone().addDays(-1)))
                    {
                        date = '昨天';
                    }
                    else if(obj.date.isSameWeek(today))
                    {
                        date = obj.date.getDayName();
                    }
                    // special description when date is in lastweek
                    // else if(obj.date.isSameWeek(today.clone().addDays(-7)))
                    // {
                    //     date = '上' + obj.date.getDayName();
                    // }
                    else if(obj.date.isSameYear(today))
                    {
                        date = obj.date.format('MM月dd日');
                    }
                    else
                    {
                        date = obj.date.format('yyyy年MM月dd日');
                    }

                    return date;
                }
            }
        }
    };

    var getEventName = function(et)
    {
        var dotIndex = et.indexOf('.');
        if(dotIndex > 0)
        {
            return et.substr(0, dotIndex);
        }
        return et;
    };

    var Storage = function()
    {
        window.store = window.store;
    };

    Storage.prototype.setPlus = function()
    {
        // window.store.setPlusStorage(window.plus);
    };

    Storage.prototype.set = function(key, value, ignoreAccount)
    {
        if (ignoreAccount)
        {
            window.store.set(key, value);
        }
        else if (window.user && window.user.account)
        {
            window.store.set(window.user.account + '::' + key, value);
        }
        else
        {
            console.error('存储失败！无法获取用户数据。');
        }
    };

    Storage.prototype.get = function(key, defaultValue, ignoreAccount)
    {
        if (ignoreAccount)
        {
            return window.store.get(key, defaultValue);
        }
        else if (window.user && window.user.account)
        {
            return window.store.get(window.user.account + '::' + key, defaultValue);
        }
        else
        {
            console.error('获取存储数据失败！无法获取用户数据。');
            return defaultValue;
        }
    };

    Storage.prototype.getUser = function()
    {
        var account = window.store.get('account', '');
        if (account !== '')
        {
            window.user = window.store.get('userlist', {status: 'logout'})[account];
            if(window.user.status === 'online')
            {
                if(new Date().getTime() - window.user.lastLoginTime > 1000 * 3600 * 24)
                {
                    window.user.status = 'offline';
                }
            }
        }
        else
        {
            window.user = {status: 'logout'};
        }
        console.groupCollapsed('%cUSER: ' + window.user.account + '@' + window.user.url, 'color: orange; border-left: 10px solid orange; padding-left: 5px;font-size: 16px; font-weight: bold;');
        console.log(window.user);
        console.groupEnd();
        return window.user;
    };

    Storage.prototype.saveUser = function()
    {
        if (window.user && window.user.account)
        {
            window.store.set('account', window.user.account);
            var userlist = window.store.get('userlist',
            {});
            userlist[window.user.account] = window.user;
            window.store.set('userlist', userlist);
        }
        else
        {
            console.error('存储失败！无法获取用户数据。');
        }
    };

    Storage.prototype.clearUser = function(account)
    {
        account = account || window.user.account;
        if(account === window.user.account)
        {
            window.store.remove('account');
        }
        account = '::' + account;
        window.store.forEach(function(key)
        {
            if(key.startWith(account))
            {
                window.store.remove(key);
            }
        });
    };

    window.storage = new Storage();

    var DataList = function(name, data)
    {
        this.name = name;
        this.loadFromStore();
        this.account = window.user['account'];
        this.clean();
        if (data)
        {
            this.load(data);
        }
    };

    DataList.prototype.loadFromStore = function()
    {
        var storeData = window.storage.get('datalist::' + this.name,
        {
            data: [],
            updateTime: new Date(0)
        });
        this.data = storeData.data;
        this.updateTime = storeData.updateTime;
        if (typeof this.updateTime === 'string')
        {
            this.updateTime = new Date(Date.parse(this.updateTime));
        }
    };

    DataList.prototype.clean = function(objOrArray)
    {
        objOrArray = objOrArray || this.data;
        var that = this;

        if (Array.isArray(objOrArray))
        {
            objOrArray.forEach(function(obj)
            {
                obj = that.clean(obj);
            });
            return objOrArray;
        }
        else
        {
            var oldVal;

            // clean numbers
            cleanMaps.number.forEach(function(tag)
            {
                oldVal = objOrArray[tag];
                if(typeof oldVal === 'string')
                {
                    objOrArray[tag] = parseInt(oldVal);
                }
            });

            // clean datetimes
            cleanMaps.date.forEach(function(tag)
            {
                oldVal = objOrArray[tag];
                if(typeof oldVal === 'string')
                {
                    objOrArray[tag] = new Date(Date.parse(oldVal));
                    if(isNaN(objOrArray[tag].getTime())) objOrArray[tag] = null;
                }
            });

            // added expand attribute
            var expands = cleanMaps.expand[this.name];
            for(var key in expands)
            {
                if(objOrArray[key]) // e.g. key = 'status'
                {
                    var epd = expands[key][objOrArray[key]]; // e.g. epd = {name: '', ...} or ''
                    if(typeof epd === 'object')
                    {
                        for(var name in epd)
                        {
                            objOrArray[key + name.upperCaseFirstLetter()] = epd[name];
                        }
                    }
                    else
                    {
                        objOrArray[key + 'Name'] = epd;
                    }
                }
            }

            // apply filter
            var filters = cleanMaps.filter[this.name],
                filter,
                result;
            for(var key in filters)
            {
                filter = filters[key];
                if(typeof filter === 'function')
                {
                    result = filter(objOrArray);
                    if(result !== undefined)
                    {
                        objOrArray[key] = result;
                    }
                }
            }
            return objOrArray;
        }
    };

    DataList.prototype.save = function()
    {
        window.storage.set('datalist::' + this.name,
        {
            data: this.data,
            updateTime: this.updateTime
        });
    };

    DataList.prototype.getById = function(id)
    {
        var result = null,
            that   = this;
        if (typeof id === 'string')
        {
            id = parseInt(id);
        }
        if (typeof id === 'number')
        {
            this.data.forEach(function(obj)
            {
                if (obj.id === id)
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
        if (typeof idOrObj === 'object')
        {
            obj = this.getById(idOrObj.id);
        }
        else
        {
            obj = this.getById(idOrObj);
        }
        return obj !== null;
    };

    DataList.prototype.markRead = function(id)
    {
        if(id)
        {
            var item = this.getById(id);
            if(item)
            {
                item.unread = false;
                this.unreadCount--;
                this.save();
            }
        }
        else
        {
            this.data.forEach(function(item)
            {
                item.unread = false;
            });
            this.save();
            this.unreadCount = 0;
        }
    };

    DataList.prototype.load = function(data)
    {
        var dt = this.data,
            that = this,
            dObj, idx;
        this.updateTime = new Date();
        // if (this.account != data.account)
        // {
        //     console.error('所获取的数据与当前帐号不匹配。');
        //     return false;
        // }

        var setName = this.name === 'story' ? 'stories' : (this.name + 's');
        data = data[this.name] || data[setName];

        data.forEach(function(obj)
        {
            obj = that.clean(obj);
            dObj = that.getById(obj.id);
            if (dObj === null)
            {
                obj.unread = true;
                dt.push(obj);
                that.unreadCount++;

                if(!that.latestItem || that.latestItem.id < obj.id)
                {
                    that.latestItem = obj;
                }
            }
            else
            {
                dt.splice(dt.indexOf(dObj), 1, obj);
            }
        });

        this.sort();
        this.save();
    };

    DataList.prototype.getUnreadCount = function(muted)
    {
        var count = this.unreadCount;
        if(muted) this.unreadCount = 0;
        return count;
    };

    DataList.prototype.getUnreadItems = function(muted)
    {
        var unreadItems = [];
        this.data.forEach(function(item)
        {
            if(item.unread)
            {
                if(muted) item.unread = false;
                unreadItems.push(item);
            }
        });
        return unreadItems;
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
        this.syncId = 0;
        this.eventDrawer = {};
        that.readyFns = [];
        this.dataTabs = dataTabs;
        this.dataTabsSet = dataTabsSet;

        $.plusReady(function()
        {
            window.storage.setPlus();
            window.storage.getUser();

            that.data = {};
            dataTabsSet.forEach(function(val)
            {
                that.data[val] = new DataList(val);
                
            });

            that.config = window.storage.get('zentaoConfig', {});
            that.session = window.storage.get('session', {});

            setTimeout(function()
            {
                that.isReady = true;
                that.trigger('ready');
            }, 100);
        });
    };

    Zentao.prototype.hasTab = function(tab)
    {
        dataTabsSet.forEach(function(val)
        {
            if(tab === val) return true;
            
        });
        return false;
    }

    Zentao.prototype.unreadCount = function(tab)
    {
        if(tab) return this.data[tab].getUnreadCount();

        var count = 0;
        for(var t in this.data)
        {
            count += this.data[t].getUnreadCount();
        }
        return count;
    };

    Zentao.prototype.on = function(e, fn)
    {
        console.color("ZENTAO ON: " + e, 'h5|bgwarning');
        var name = getEventName(e);
        if(!this.eventDrawer[name])
        {
            this.eventDrawer[name] = [];
        }
        this.eventDrawer[name].push({name: e, fn: fn});
        // console.log('drawer:', this.eventDrawer);
        return this;
    };

    Zentao.prototype.off = function(e)
    {
        var name = getEventName(e);
        var drawer = this.eventDrawer[name];
        if(drawer)
        {
            var et;
            for (var i = drawer.length - 1; i >= 0; i--)
            {
                et = drawer[i];
                if(e === et.name || et.name.startWith(e + '.'))
                {
                    drawer.splice(i, 1);
                }
            };
        }
        return this;
    };

    Zentao.prototype.trigger = function(e, pramas)
    {
        console.color("ZENTAO TRIGGER: " + e, 'h5|bgwarning');
        // console.log('drawer:', this.eventDrawer);
        var name = getEventName(e);
        var drawer = this.eventDrawer[name];
        var result;
        if(drawer)
        {
            var et;
            for (var i = 0; i < drawer.length; ++i)
            {
                et = drawer[i];
                if(e === et.name || et.name.startWith(e + '.'))
                {
                    result = et.fn(pramas);
                }
            };
        }
        return result;
    };

    Zentao.prototype.ready = function(fn)
    {
        this.on('ready', fn);
    };

    Zentao.prototype.logout = function(clean, callback)
    {
        if(clean)
        {
            window.storage.clearUser();
        }
        else
        {
            window.user.status = 'logout';
            window.user.pwdMd5 = null;
            window.storage.saveUser();
        }

        callback && callback(clean);
    };

    /* Get zentao config and login in zentao */
    Zentao.prototype.login = function(loginkey, successCallback, errorCallback)
    {
        if(this.trigger('logging') === false)
        {
            that.callWidthMessage(errorCallback, '登录被取消。');
            return;
        }

        var that = this;
        if (loginkey)
        {
            window.user.url = loginkey.url;
            window.user.account = loginkey.account;
            window.user.pwdMd5 = loginkey.pwdMd5;
        }
        var callError = function(message)
        {
            if(window.user.status === 'online')
            {
                window.user.status = 'offline';
            }
            window.storage.saveUser();
            that.trigger('logged', false);
        };

        this.getConfig(function()
        {
            var checkVer = that.checkVersion();
            if (!checkVer.result)
            {
                that.callWidthMessage(callError, checkVer.message);
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
                        successCallback && successCallback();
                        that.trigger('logged', true);
                    }, that.fnToCallWidthMessage(callError, '在登录时无法获取角色。'));
                }, that.fnToCallWidthMessage(callError, '登录验证失败。'));
            }, that.fnToCallWidthMessage(callError, '在登录时获取Session失败。'));
        }, that.fnToCallWidthMessage(callError, '在登录时获取配置失败。'));
    };

    Zentao.prototype.tryLogin = function(successCallback, errorCallback)
    {
        var url = this.concatUrl(
            {
                module: 'user',
                method: 'login'
            }),
            that = this;
        $.get(url, function(response)
        {
            var status = JSON.parse(response);
            if (status['status'] === 'failed')
            {
                that.callWidthMessage(errorCallback, '所提供的用户名和密码不正确。');
            }
            else
            {
                successCallback && successCallback(status);
            }
        }, function(xhr)
        {
            if (xhr.status === 0 || xhr.status === 302)
            {
                successCallback && successCallback(status);
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
            session = this.session,
            viewType = params.viewType || 'json',
            moduleName = params.module,
            methodName = params.method,
            requestType = (this.config.requestType || 'get').toLowerCase();

        if (requestType === 'get')
        {
            url += '/index.php?';
            if (moduleName === 'user' && methodName === 'login')
            {
                var password = md5(window.user.pwdMd5 + session.rand);
                url += 'm=user&f=login&account=' + user.account +
                    '&password=' + password + '&' + session.sessionName +
                    '=' + session.sessionID + '&t=json';
                return url;
            }

            url += 'm=' + moduleName + '&f=' + methodName;

            if (moduleName === 'api' && methodName.toLowerCase() === 'getmodel')
            {
                url += '&moduleName=' + params.moduleName + '&methodName=' + params.methodName + '&params=';
                var item;
                var stringSet = ',viewType,module,method,moduleName,methodName,pageID,type,recTotal,recPerPage,id,';
                for (var i in params)
                {
                    item = params[i];
                    if (stringSet.indexOf(',' + i + ',') > 0) continue;
                    url += i + '=' + item + '&';
                }
            }
            else if (moduleName === 'my')
            {
                url += '&type=' + params.type;
            }
            {
                url += '&' + moduleName + 'ID=' + params.id;
            }

            if (params.pageID)
            {
                if (methodName === 'todo')
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

            if (session && moduleName !== 'api' && methodName.toLowerCase() !== 'getsessionid')
            {
                url += '&' + session.sessionName + '=' + session.sessionID;
            }
        }
        else
        {
            url += '/';
            if (moduleName === 'user' && methodName === 'login')
            {
                var password = md5(window.user.pwdMd5 + session.rand);
                url += 'user-login.json?account=' + user.account + '&password=' + password + '&' + (session.sessionName || 'sid') + '=' + session.sessionID;
                return url;
            }

            url += moduleName + '-' + methodName + '-';

            if (moduleName === 'api' && methodName.toLowerCase() === 'getmodel')
            {
                url += params.moduleName + '-' + params.methodName + '-';
            }
            else if (moduleName === 'my')
            {
                url += params.type + '-';
            }

            var item;
            var stringSet = ',viewType,module,method,moduleName,methodName,pageID,type,recTotal,recPerPage,';
            for (var i in params)
            {
                item = params[i];
                if (stringSet.indexOf(',' + i + ',') > 0) continue;
                if (methodName !== 'view' || i !== 'id')
                {
                    url += i + '=';
                }
                url += item + '-';
            }

            if (params.pageID)
            {
                if (methodName === 'todo')
                {
                    url += '-all-date_desc,status,begin-';
                }
                else
                {
                    url += 'id_desc-';
                }

                url += params.recTotal + '-' + params.recPerPage + '-' + params.pageID;
            }

            if (url.lastIndexOf('-') === (url.length - 1))
            {
                url = url.substr(0, url.length - 1);
            }

            url += '.' + viewType;

            if (session && moduleName !== 'api' && methodName.toLowerCase() !== 'getsessionid')
            {
                url += '?' + session.sessionName + '=' + session.sessionID;
            }
        }

        return url;
    };

    Zentao.prototype.getSession = function(successCallback, errorCallback)
    {
        var url = this.concatUrl(
            {
                module: 'api',
                method: 'getSessionID'
            }),
            that = this;
        $.get(url, function(response)
        {
            var session = JSON.parse(response);
            if (session['status'] === 'success')
            {
                session = JSON.parse(session.data);

                if (session.sessionID && session.sessionID != 'undefined')
                {
                    that.session = session;
                    window.storage.set('session', session);
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
        var url = this.concatUrl(
            {
                module: 'api',
                method: 'getmodel',
                moduleName: 'user',
                methodName: 'getById',
                account: window.user.account
            }),
            that = this;
        $.get(url, function(response)
        {
            var roleData = JSON.parse(response);
            if (roleData['status'] !== 'failed')
            {
                roleData = JSON.parse(roleData.data);
                window.user.role = roleData.role;
                window.user.status = 'online';
                window.user.lastLoginTime = new Date().getTime();
                window.storage.saveUser();
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
        $.get(window.user.url + '/index.php?mode=getconfig', function(response)
        {
            var config = JSON.parse(response);
            if (config.version)
            {
                that.config = config;
                window.storage.set('zentaoConfig', config);
                successCallback && successCallback(config);
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取配置信息不正确，请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。');
            }
        }, that.fnToCallWidthMessage(errorCallback, '无法获取禅道配置，请检查禅道地址是否正确。'));
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
        return function(params)
        {
            if(typeof params === 'string')
            {
                message += params
            }
            else if(params && params.message)
            {
                message += params.message;
            }
            that.callWidthMessage(callback, message, params);
        };
    }

    Zentao.prototype.checkVersion = function()
    {
        var version = this.config.version.toLowerCase();
        var isPro = version.indexOf('pro');

        if (isPro)
        {
            version = version.replace('pro', '');
        }

        var verNum = parseFloat(version);
        var result = {
            result: false
        };

        if (isPro && verNum < 1.3)
        {
            result.message = '你的当前版本是' + version + '，请升级至pro1.3以上';
        }
        else if (!isPro && verNum < 4)
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
        if (typeof start === 'undefined') start = new Date();
        if (typeof count === 'undefined') count = 10;
        else if (count === 'all') count = 999999;

        console.color('GetData: ' + dataType + ',' + start + ',' + count, 'h4|info');

        if (typeof dataType === 'undefined' || this.hasTab(dataType))
        {
            console.error('无法检索数据，因为没有指定DataType或者指定的dataType不受支持。');
            return false;
        }

        var type = 'unkown';
        if (typeof start === 'number')
        {
            type = 'id';
        }
        else if (start instanceof Date)
        {
            type = 'date';
        }
        else if (start && start.id)
        {
            type = 'id';
            start = start.id;
        }
        else if (typeof start === 'function')
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
        if (type === 'function')
        {
            data.forEach(function(obj)
            {
                if (start(obj))
                {
                    result.push(obj);
                }
                if ((++thisCount) >= count) return false;
            });
        }
        else
        {
            data.forEach(function(obj)
            {
                if (obj[type] < start)
                {
                    result.push(obj);
                }
                if ((++thisCount) >= count) return false;
            });
        }

        return result;
    };

    Zentao.prototype.filterData = function(dataType, filter)
    {
        console.color('FilterData: ' + dataType + ',' + filter, 'h4|info');

        var result = [],
            data = this.data[dataType];
        if (!data) return false;

        data.loadFromStore();

        if (dataType === 'todo')
        {
            if (filter === 'today')
            {
                var today = Date.parseName('today');
                data.data.forEach(function(val)
                {
                    if (val.date >= today)
                    {
                        result.push(val);
                    }
                });
            }
            else if (filter === 'yestoday')
            {
                var today = Date.parseName('today');
                var yestoday = today.clone().addDays(-1);
                data.data.forEach(function(val)
                {
                    if (val.date >= yestoday && val.date < today)
                    {
                        result.push(val);
                    }
                });
            }
            else if (filter === 'thisweek')
            {
                var thisweek = Date.parseName('thisweek');
                data.data.forEach(function(val)
                {
                    if (val.date >= thisweek)
                    {
                        result.push(val);
                    }
                });
            }
            else if (filter === 'lastweek')
            {
                var thisweek = Date.parseName('thisweek');
                var lastweek = thisweek.clone().addDays(-7);
                data.data.forEach(function(val)
                {
                    if (val.date >= lastweek && val.date < thisweek)
                    {
                        result.push(val);
                    }
                });
            }
        }
        else if(dataType === 'task' || dataType === 'bug' || dataType === 'story')
        {
            var cdt = {};
            cdt[filter] = window.user.account;
            data.data.where(cdt, result);
        }

        console.log('FilterData:', result);
        return result;
    };

    Zentao.prototype.tryLoadData = function(dataType, successCallback, errorCallback, count)
    {
        console.color('LoadData: ' + dataType, 'h4|info');

        if(this.network === 'disconnect')
        {
            this.callWidthMessage(errorCallback, '没有连接网络。');
            return false;
        }

        if (typeof dataType === 'undefined' || this.hasTab(dataType))
        {
            this.callWidthMessage(errorCallback, '无法加载数据，因为没有指定DataType或者指定的dataType不受支持。');
            return false;
        }

        var currentUser = window.storage.getUser();
        if(!currentUser || currentUser.status !== 'online')
        {
            this.callWidthMessage(errorCallback, '请先登录。');
            return false;
        }

        if (typeof count === 'undefined')
        {
            var data = this.data[dataType];
            if (data.data.length < 1)
            {
                count = 1000;
            }
            else
            {
                var pastTime = ((new Date()).getTime() - data.updateTime.getTime()) / 60000; // 分钟为单位
                count = Math.max(1000, Math.min(20, Math.floor(pastTime * 0.5)));
            }
        }
        var that = this,
            url = this.concatUrl(
            {
                module: 'my',
                method: dataType,
                type: 'all',
                pageID: 1,
                recTotal: count,
                recPerPage: count
            });

        $.get(url, function(response)
        {
            var dt = JSON.parse(response);
            if (dt['status'] === 'success')
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
    };

    Zentao.prototype.loadData = function(dataType, successCallback, errorCallback, count)
    {
        // if(window.user && window.user.status === 'online')
        // {
        //     this.tryLoadData(dataType, successCallback, errorCallback, count);
        // }
        // else
        // {
        //     var that = this;
        //     this.login(null, function()
        //     {
        //         that.tryLoadData(dataType, successCallback, errorCallback, count);
        //     }, this.fnToCallWidthMessage(errorCallback, '登录失败，无法从服务器加载数据。'));
        // }
        // 
        this.tryLoadData(dataType, successCallback, errorCallback, count);
    };

    Zentao.prototype.startAutoSync = function(interval, successCallback, errorCallback)
    {
        if(!interval) interval = window.storage.get('syncInterval', 6000);
        var that = this;
        this.autoSyncId = setInterval(function(){that.sync('AUTO', successCallback, errorCallback)}, interval);
    };

    Zentao.prototype.stopAutoSync = function()
    {
        if(this.autoSyncId) clearInterval(this.autoSyncId);
        this.autoSyncId = null;
    }

    Zentao.prototype.sync = function(tab, successCallback, errorCallback)
    {
        if(this.network === 'disconnect') return;

        var that = this;
        if(tab === 'AUTO' || typeof tab === 'undefined')
        {
            tab = dataTabsSet[(this.syncId++)%dataTabsSet.length];
        }
        var params = {tab: tab};
        that.trigger('syncing', params);
        that.loadData(tab, function()
        {
            params.result = true;
            params.unreadCount = that.data[tab].getUnreadCount(that.runningInBackground);
            params.latestItem = that.data[tab].latestItem;
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
}(mui);
