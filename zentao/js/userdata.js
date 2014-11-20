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
        if(!window.CONFIG.debug) window.store.setStorage(storage);
    };

    UserStore.prototype.setAccount = function(account)
    {
        this.account = account;
        this.store.set('account', this.account);
    };

    UserStore.prototype.set = function(key, value)
    {
        if (this.account)
        {
            this.store.set(this.account + '::' + key, value);
        }
        else
        {
            // console.error('存储失败！无法获取用户数据。');
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
            // console.error('获取存储数据失败！无法获取用户数据。');
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

        // console.groupCollapsed('%cUSER: ' + this.user.account + '@' + this.user.url, 'color: orange; border-left: 10px solid orange; padding-left: 5px;font-size: 16px; font-weight: bold;');
        // console.log('user:', this.user);
        // console.groupEnd();

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
            // console.error('存储失败！无法获取用户数据。');
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
                    'active'    : {name: '激活',   color: 'primary'},
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
                },
                begin: function(obj)
                {
                    return obj.begin.substr(0, 2) + ':' + obj.begin.substr(2);
                },
                end: function(obj)
                {
                    return obj.end.substr(0, 2) + ':' + obj.end.substr(2);
                }
            }
        }
    };

    var discardRules = 
    {
        todo: function(obj, account)
        {
            return obj.account !== account;
        },
        task: function(obj, account)
        {
            return obj.assignedTo !== account && obj.openedBy !== account && obj.finishedBy !== account;
        },
        bug: function(obj, account)
        {
            return obj.assignedTo !== account && obj.openedBy !== account && obj.resolvedBy !== account;
        },
        story: function(obj, account)
        {
            return obj.assignedTo !== account && obj.openedBy !== account && obj.reviewedBy !== account;
        }
    };

    var DataList = function(names /*, data*/)
    {
        // this.loadFromStore();
        this.account = window.user.account;
        // this.clean();
        this.data = {};
        this.isEmpty = true;
        if(names) this.loadFromStore(names);
        // if (data)
        // {
        //     this.load(data);
        // }
    };

    DataList.prototype.empty = function()
    {
        this.isEmpty = true;
        this.account = null;
        for(var n in this.data)
        {
            this.data[n] = {data: [], updateTime: new Date(0)};
        }
    };

    DataList.prototype.loadFromStore = function(name, notCheckUser)
    {
        if(!this.account || !notCheckUser)
        {
            window.userStore.getUser();
            this.account = window.user.account;
        }

        if(!name)
        {
            for(var n in this.data)
            {
                this.loadFromStore(n, true);
            }
            this.lastLoadTime = window.userStore.get('datalist::lastLoadTime');
            return;
        }
        else if(Array.isArray(name))
        {
            var that = this;
            name.forEach(function(n)
            {
                that.loadFromStore(n, true);
            });
            this.lastLoadTime = window.userStore.get('datalist::lastLoadTime');
            return;
        }

        var storeData = window.userStore.get('datalist::' + name,
        {
            data: [],
            updateTime: new Date(0)
        });
        if(typeof storeData.updateTime === 'string') storeData.updateTime = new Date(Date.parse(storeData.updateTime));
        this.data[name] = storeData;
    };

    /**
     * Clean object
     * @param  {Array|Object} objOrArray
     * @return {Object}
     */
    DataList.prototype.clean = function(objOrArray, name)
    {
        var that = this;

        if (Array.isArray(objOrArray))
        {
            objOrArray.forEach(function(obj)
            {
                obj = that.clean(obj, name);
            });
            return objOrArray;
        }
        else
        {
            var oldVal;
            name = objOrArray.dataType || name;

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
            var expands = cleanMaps.expand[name], key;
            for(key in expands)
            {
                if(objOrArray[key]) // e.g. key = 'status'
                {
                    var epd = expands[key][objOrArray[key]]; // e.g. epd = {name: '', ...} or ''
                    if(typeof epd === 'object')
                    {
                        for(var n in epd)
                        {
                            objOrArray[key + n.upperCaseFirstLetter()] = epd[n];
                        }
                    }
                    else
                    {
                        objOrArray[key + 'Name'] = epd;
                    }
                }
            }

            // apply filter
            var filters = cleanMaps.filter[name],
                filter,
                result;
            for(key in filters)
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

    DataList.prototype.save = function(name)
    {
        if(!name)
        {
            for(var n in this.data)
            {
                this.save(n);
            }
            window.userStore.set('datalist::lastLoadTime', this.lastLoadTime);
            return;
        }
        window.userStore.set('datalist::' + name, this.data[name]);
    };

    DataList.prototype.getById = function(name, id)
    {
        var result = null;
        if (typeof id === 'string')
        {
            id = parseInt(id);
        }
        if (typeof id === 'number')
        {
            this.data[name].data.forEach(function(obj)
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
            // console.error('The "Id" must be a number.');
        }
        return result;
    };

    DataList.prototype.has = function(name, idOrObj)
    {
        var obj = null;
        if (typeof idOrObj === 'object')
        {
            obj = this.getById(name, idOrObj.id);
        }
        else
        {
            obj = this.getById(name, idOrObj);
        }
        return obj !== null;
    };

    DataList.prototype.markRead = function(name, id, notSave)
    {
        // console.log('MARK READ', name, id, notSave);
        if(id)
        {
            var item = this.getById(name, id);
            if(item)
            {
                item.unread = false;
                if(!notSave) this.save(name);
            }
        }
        else
        {
            if(!name)
            {
                for(var n in this.data)
                {
                    this.markRead(n);
                }
                return;
            }

            this.data[name].data.forEach(function(item)
            {
                item.unread = false;
            });
            if(!notSave) this.save(name);
        }
    };

    DataList.prototype.loadItem = function(name, obj)
    {
        var that = this;
        obj.dataType = name;
        obj.syncTime = new Date();
        obj._DETAIL = 1;
        obj = that.clean(obj);
        if(obj.desc)
        {
            obj.desc = obj.desc.replace(/\r/gi, '')
                    .replace(/\n/g, '')
                    .replace(/"/gi, '\\"');
        }

        var dt = that.data[name];
        if(!dt)
        {
            dt = {data: [obj], updateTime: new Date()};
        }
        else
        {
            var dObj = that.getById(name, obj.id);
            if(dObj)
            {
                obj.unread = dObj.unread;
                dt.data.splice(dt.data.indexOf(dObj), 1, obj);
            }
            else
            {
                obj.unread = true;
                dt.data.push(obj);
            }
        }
        that.data[name] = dt;
        that.save(name);

        console.log('load item', name, obj);

        return obj;
    };

    DataList.prototype.load = function(data, name)
    {
        if(!data)
        {
            return;
        }

        if (this.account != window.user.account)
        {
            this.loadFromStore(name);
            // console.log('所获取的数据与当前帐号不匹配。已重新从存储读取。', this.account);
        }

        if(!name)
        {
            for(var n in data)
            {
                var setName = n === 'stories' ? 'story' : (n.substr(0, n.length-1));
                this.load(data[n], setName);
            }
            return;
        }

        var dt = this.data[name];
        if(!dt)
        {
            dt = {data: []};
        }
        dt.updateTime = new Date();

        var that = this,
            dObj;
        dt.unreadCount = 0;
        var key = data.key;

        if(key)
        {
            var getObj = function(valArray)
            {
                var result = {};
                valArray.forEach(function(val, iKey)
                {
                    result[key[iKey]] = val;
                });
                return result;
            };
            dt.newItems = [];
            for(var idx in data)
            {
                if(idx === 'key') continue;
                var obj = getObj(data[idx]);

                if(discardRules[name](obj, window.user.name))
                {
                    // console.log('discard', name, obj, window.user.name);
                    continue;
                }

                obj.dataType = name;
                obj.syncTime = new Date();
                obj = that.clean(obj);
                dObj = that.getById(name, obj.id);
                if (dObj === null)
                {
                    obj.unread = true;

                    dt.newItems.push(obj);
                    dt.data.push(obj);

                    dt.unreadCount++;
                }
                else
                {
                    if(dObj.unread)
                    {
                        obj.unread = true;
                    }
                    dt.data.splice(dt.data.indexOf(dObj), 1, obj);
                }

                if(!dt.latestItem || dt.latestItem.id <= obj.id)
                {
                    dt.latestItem = obj;
                    that.latestItem = obj;
                }
            }
        }

        if(dt.data.length) that.isEmpty = false;

        that.lastLoadTime = new Date();
        that.data[name] = dt;

        that.sort(name);
        that.save(name);
    };

    DataList.prototype.getNewItems = function(name)
    {
        if(!name)
        {
            var newItems = {total: 0};
            for(var n in this.data)
            {
                newItems[n] = this.data[n].newItems;
                if(newItems[n])
                {
                    newItems.total += newItems[n].length;
                    if(newItems[n].length)
                    {
                        newItems.latest = newItems[n][0];
                    }
                }
            }
            return newItems;
        }
        return this.data[name].newItems;
    };

    DataList.prototype.getUnreadCount = function(name, muted)
    {
        if(!name)
        {
            var unRreadCount = {total: 0};
            var unreadItems = this.getUnreadItems();
            for(var n in unreadItems)
            {
                unRreadCount[n] = unreadItems[n].length;
                unRreadCount.total += unRreadCount[n];
            }
            return unRreadCount;
        }

        return this.getUnreadItems(name, muted).length;
    };

    DataList.prototype.getUnreadItems = function(name, muted)
    {
        if(!name)
        {
            var unRreadData = {};
            for(var n in this.data)
            {
                unRreadData[n] = this.getUnreadItems(n, muted);
            }
            return unRreadData;
        }
        var unreadItems = [];
        var needSave = false;
        this.data[name].data.forEach(function(item)
        {
            if(item.unread)
            {
                if(muted)
                {
                    item.unread = false;
                    needSave = true;
                }
                unreadItems.push(item);
            }
        });

        if(needSave) this.save(name);
        return unreadItems;
    };

    DataList.prototype.sort = function(name, fn)
    {
        this.data[name].data.sort(fn || function(a, b)
        {
            return b.id - a.id;
        });
    };

    DataList.prototype.filter = function(name, filter, reload)
    {
        // console.color('FilterData: ' + name + ',' + filter, 'h4|info');

        if(reload) this.loadFromStore();

        var result = [],
            data = this.data[name].data;

        if(typeof filter === 'function')
        {
            result = data.filter(filter);
        }
        else
        {
            result = [];
            var today;
            if (name === 'todo')
            {
                if (filter === 'today')
                {
                    today = Date.parseName('today');
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
                    today = Date.parseName('today');
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
            else if(name === 'task' || name === 'bug' || name === 'story')
            {
                var cdt = {};
                cdt[filter] = window.user.name;
                data.where(cdt, result);
            }
        }

        // console.log('FilterData:', result);
        return result;
    };

    window.DataList = DataList;
}());
