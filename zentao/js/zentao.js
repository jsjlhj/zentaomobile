/**
 * User storage
 */
(function()
{
    var UserStore = function()
    {
        this.store = window.store;
        this.user;
        this.account;
    };

    UserStore.prototype.setStorage = function(storage)
    {
        window.store.setStorage(storage);
    };

    UserStore.prototype.setAccount = function(account)
    {
        this.account = account;
        this.store.set('account', this.account);
    }

    UserStore.prototype.set = function(key, value)
    {
        if (this.account)
        {
            this.store.set(this.account + '::' + key, value);
        }
        else
        {
            console.error('存储失败！无法获取用户数据。');
        }
    };

    UserStore.prototype.get = function(key, defaultValue)
    {
        if (this.account)
        {
            return this.store.get(this.account + '::' + key, defaultValue);
        }
        else
        {
            console.error('获取存储数据失败！无法获取用户数据。');
            return defaultValue;
        }
    };

    UserStore.prototype.getUser = function(account)
    {
        if(!account)
        {
            account = this.store.get('account', this.account);
        }
        this.account = account;

        if(account)
        {
            this.userlist = this.store.get('userlist', {});
            this.user = this.userlist[account];

            if(this.user && this.user.status === 'online')
            {
                if(new Date().getTime() - this.user.lastLoginTime > 1000 * 3600 * 24)
                {
                    this.user.status = 'offline';
                }
            }
        }
        else
        {
            this.user = {status: 'logout'};
        }

        window.user = this.user;

        console.groupCollapsed('%cUSER: ' + this.user.account + '@' + this.user.url, 'color: orange; border-left: 10px solid orange; padding-left: 5px;font-size: 16px; font-weight: bold;');
        console.log(user, this.user);
        console.groupEnd();

        return this.user;
    };

    UserStore.prototype.saveUser = function(data)
    {
        data = data || window.user;

        if(data.account && data.account != this.account)
        {
            this.setAccount(data.account);
            this.getUser();
        }

        this.user = Object.extend(this.user, data);

        if(this.user)
        {
            this.userList[this.account] = this.user;
            this.store.set('userlist', userlist);
        }
        else
        {
            console.error('存储失败！无法获取用户数据。');
        }
    };

    UserStore.prototype.clearUser = function(account)
    {
        account = account || this.account;
        if(account === this.account)
        {
            this.store.remove('account');
        }
        account += '::';
        var store = this.store;
        this.store.forEach(function(key)
        {
            if(key.startWith(account))
            {
                store.remove(key);
            }
        });
    };

    window.userStore = new UserStore();
}());

/**
 * Data list
 */
(function()
{
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
                    'wait'      : {name: '未完成', color: 'primary'},
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
        var storeData = window.userStore.get('datalist::' + this.name,
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
        window.userStore.set('datalist::' + this.name,
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
            console.error('The "Id" must be a number.');
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
        if (this.account != window.user.account)
        {
            this.loadFromStore();
            console.color('所获取的数据与当前帐号不匹配。已重新从磁盘读取', 'h3|danger');
        }

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

        console.log(this);
    };

    DataList.prototype.getUnreadCount = function(muted)
    {
        var count = this.unreadCount;
        if(muted && count)
        {
            this.markRead();
        }
        return count;
    };

    DataList.prototype.getUnreadItems = function(muted)
    {
        var unreadItems = [];
        var needSave = false;
        this.unreadCount = 0;
        this.data.forEach(function(item)
        {
            if(item.unread)
            {
                if(muted)
                {
                    item.unread = false;
                    needSave = true;
                }
                else
                {
                    this.unreadCount++;
                }
                unreadItems.push(item);
            }
        });

        if(needSave) this.save();
        return unreadItems;
    };

    DataList.prototype.sort = function(fn)
    {
        this.data.sort(fn || function(a, b)
        {
            return b.id - a.id;
        });
    };

    window.DataList = DataList;
)());

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
            window.userStore.setPlus();
            window.userStore.getUser();

            that.data = {};
            dataTabsSet.forEach(function(val)
            {
                that.data[val] = new DataList(val);
                
            });

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
        
        return this.eventDrawer.on(e, fn);
    };

    Zentao.prototype.off = function(e)
    {
        return this.eventDrawer.off(e);
    };

    Zentao.prototype.trigger = function(e, pramas)
    {
        console.color("ZENTAO TRIGGER: " + e, 'h5|bgwarning');
        
        return this.eventDrawer.trigger(e, pramas, this);
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

            callback && callback(clean);
        }

        http.get(this.concatUrl({module: 'user', method: 'logout'}), afterLogout, afterLogout);
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
            if(!loginkey.url.startWith('http://') || !loginkey.url.startWith('https://'))
            {
                loginkey.url = 'http://' + loginkey.url;
            }

            Object.extend(window.user, loginkey);
        }
        var callError = function(message)
        {
            if(window.user.status === 'online')
            {
                window.userStore.saveUser({status: offline});
            }
            that.trigger('logged', false);
            errorCallback && errorCallback(message);
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
        http.get(url, function(response)
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
            session = window.user.session,
            viewType = params.viewType || 'json',
            moduleName = params.module,
            methodName = params.method,
            requestType = (window.userStore.user.config.requestType || 'get').toLowerCase();

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
        http.get(url, function(response)
        {
            var session = JSON.parse(response);
            if (session['status'] === 'success')
            {
                session = JSON.parse(session.data);

                if (session.sessionID && session.sessionID != 'undefined')
                {
                    window.userStore.saveUser({session: session});
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
        http.get(url, function(response)
        {
            var roleData = JSON.parse(response);
            if (roleData['status'] !== 'failed')
            {
                roleData = JSON.parse(roleData.data);
                window.userStore.saveUser(
                {
                    role: roleData.role,
                    status: 'online',
                    lastLoginTime: new Date().getTime()
                });
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
        var url = window.user.url + '/index.php?mode=getconfig';
        http.get(url, function(response)
        {
            var config = JSON.parse(response);
            if (config.version)
            {
                window.userStore.saveUser({config: config});
                successCallback && successCallback(config);
            }
            else
            {
                that.callWidthMessage(errorCallback, '获取配置信息不正确，请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。');
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
        
        var version = window.userStore.config.version.toLowerCase();
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

        // data.loadFromStore();

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
            else if (filter === 'undone')
            {
                data.data.forEach(function(val)
                {
                    if (val.status != 'done')
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

    Zentao.prototype.tryLoadData = function(options, successCallback, errorCallback, count)
    {
        if(typeof options === 'string')
        {
            options = {type: options};
        }

        if(options.type === 'todo' || this.isNewVersion || !options.tab) options.tab = 'all';

        console.color('LoadData: type=' + options.type + ', tab=' + options.tab, 'h4|info');

        if(this.network === 'disconnect')
        {
            this.callWidthMessage(errorCallback, '没有连接网络。');
            return false;
        }

        if (typeof options.type === 'undefined' || this.hasTab(options.type))
        {
            this.callWidthMessage(errorCallback, '无法加载数据，因为没有指定DataType或者指定的options.type不受支持。');
            return false;
        }

        var currentUser = window.userStore.user;
        if(!currentUser || currentUser.status !== 'online')
        {
            this.callWidthMessage(errorCallback, '请先登录。');
            return false;
        }

        if (typeof count === 'undefined')
        {
            var data = this.data[options.type];
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
                method: options.type,
                type: options.tab,
                pageID: 1,
                recTotal: count,
                recPerPage: count
            });

        http.get(url, function(response)
        {
            var dt = JSON.parse(response);
            if (dt['status'] === 'success')
            {
                dt = JSON.parse(dt.data);
                that.data[options.type].load(dt);
                successCallback && successCallback(dt);
            }
            else
            {
                that.isNewVersion = false;
                that.callWidthMessage(errorCallback, '无法获取用户数据，请确保所登录的账户拥有超级model权限。禅道权限管理请参考：http://www.zentao.net/book/zentaopmshelp/71.html。')
            }

        }, that.fnToCallWidthMessage(errorCallback, '无法获取数据，请检查网络。'));
    };

    Zentao.prototype.loadData = function(options, successCallback, errorCallback, count)
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
        this.tryLoadData(options, successCallback, errorCallback, count);
    };

    Zentao.prototype.startAutoSync = function(interval, successCallback, errorCallback)
    {
        if(!interval) interval = window.userStore.get('syncInterval', 20000) / dataTabsSet.length;
        console.color('startAutoSync:' + interval, 'h3|bgdanger');
        var that = this;
        this.autoSyncId = setInterval(function(){that.sync('AUTO', successCallback, errorCallback)}, interval);
    };

    Zentao.prototype.stopAutoSync = function()
    {
        if(this.autoSyncId) clearInterval(this.autoSyncId);
        this.autoSyncId = null;
    };

    Zentao.prototype.restartAutoSync = function(interval, successCallback, errorCallback)
    {
        this.stopAutoSync();
        this.startAutoSync(interval, successCallback, errorCallback);
    };

    Zentao.prototype.sync = function(tab, successCallback, errorCallback)
    {
        if(this.network === 'disconnect') return;
        if(!window.user || window.user.status !== 'online') return;

        var subTab = 'all';
        var that = this;
        if(typeof tab === 'undefined' || tab === 'AUTO')
        {
            tab = dataTabsSet[(this.syncId++)%dataTabsSet.length];
        }
        if(tab != 'todo' && !this.isNewVersion)
        {
            var subsSet =  dataTabs[tab].subsSet;
            subTab = subsSet[(dataTabs[tab].syncId++)%subsSet.length];
        }

        var params = {tab: tab};
        that.trigger('syncing', params);
        that.loadData({type: tab, tab: subTab}, function()
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
}());
