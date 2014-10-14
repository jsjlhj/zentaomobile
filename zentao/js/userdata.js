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

    UserStore.prototype.init = function()
    {
        this.setStorage(window.plus.storage);
        this.getUser();
    };

    UserStore.prototype.setStorage = function(storage)
    {
        // window.store.setStorage(storage);
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
        this.account  = account;
        this.userlist = this.store.get('userlist', {});
        this.user     = {status: 'logout'};

        if(this.account)
        {
            this.user = this.userlist[this.account] || this.user;

            if(this.user.status === 'online')
            {
                if(new Date().getTime() - this.user.lastLoginTime > 1000 * 3600 * 24)
                {
                    this.user.status = 'offline';
                }
            }
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
            this.userlist[this.account] = this.user;
            this.store.set('userlist', this.userlist);
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

    DataList.prototype.filter = function(filter, reload)
    {
        console.color('FilterData: ' + this.name + ',' + filter, 'h4|info');

        if(reload) this.loadFromStore();

        var result = [],
            data = this.data;

        if(typeof filter === 'function')
        {
            result = data.filter(filter);
        }
        else
        {
            result = [];
            if (this.name === 'todo')
            {
                if (filter === 'today')
                {
                    var today = Date.parseName('today');
                    data.forEach(function(val)
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
                    data.forEach(function(val)
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
                    data.forEach(function(val)
                    {
                        if (val.date >= thisweek)
                        {
                            result.push(val);
                        }
                    });
                }
                else if (filter === 'undone')
                {
                    data.forEach(function(val)
                    {
                        if (val.status != 'done')
                        {
                            result.push(val);
                        }
                    });
                }
            }
            else if(this.name === 'task' || this.name === 'bug' || this.name === 'story')
            {
                var cdt = {};
                cdt[filter] = window.user.account;
                data.where(cdt, result);
            }
        }

        console.log('FilterData:', result);
        return result;
    };

    window.DataList = DataList;
}());
