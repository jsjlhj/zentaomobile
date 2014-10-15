/*!
 * ZUI for mobile - v0.1.0-beta - 2014-10-14
 * http://zui.sexy
 * GitHub: https://github.com/easysoft/zui.git 
 * Copyright (c) 2014 cnezsoft.com; Licensed MIT
 */

/* Some code copy from ratchet v2.0.2 (Copyright (c) 2014 connors and other contributors. Licensed under http://www.apache.org/licenses/)*/

(function()
{
    'use strict';
    
    var cstyle = 
    {
        h1: 'font-size: 28px; font-weight: bold;',
        h2: 'font-size: 24px; font-weight: bold;',
        h3: 'font-size: 20px; font-weight: bold;',
        h4: 'font-size: 16px; font-weight: bold;',
        h5: 'font-size: 14px; font-weight: bold;',
        h6: 'font-size: 12px; font-weight: bold;',
        success: 'color: green; border-left: 10px solid green; padding-left: 5px;',
        danger: 'color: red; border-left: 10px solid red; padding-left: 5px;',
        warning: 'color: orange; border-left: 10px solid orange; padding-left: 5px;',
        info: 'color: blue; border-left: 10px solid blue; padding-left: 5px;',
        muted: 'color: gray; border-left: 10px solid gray; padding-left: 5px;',
        u: 'text-decoration: underline;',
        bd: 'border: 1px solid #ddd',
        bgsuccess: 'color: #fff; background: green; padding: 2px 5px;',
        bgdanger: 'color: #fff; background: red; padding: 2px 5px;',
        bgwarning: 'color: #fff; background: orange; padding: 2px 5px;',
        bginfo: 'color: #fff; background: blue; padding: 2px 5px;',
        bgmuted: 'color: #fff; background: gray; padding: 2px 5px;',
        bdsuccess: 'border:1px solid green;',
        bddanger: 'border:1px solid red;',
        bdwarning: 'border:1px solid orange;',
        bdinfo: 'border:1px solid blue;',
        bdmuted: 'border:1px solid gray;',
        strong: 'font-weight: bold;',
        small: 'font-size: 0.85em'
    };

    window.consolelog = function(text, style)
    {
        if (style.indexOf('|') >= 0)
        {
            var styles = style.split('|');
            style = '';
            for (var i = 0; i < (styles.length); ++i)
            {
                style += cstyle[styles[i]];
            }
        }
        else
        {
            style = cstyle[style] || style;
        }
        console.log('%c' + text, style);
    };

    console.color = window.consolelog;
    console.cstyle = cstyle;
}());

(function()
{
    /**
     * Get prototype of a object
     * @param  {object} obj
     * @return {object}
     */
    if(!Object.getPrototypeOf)
    {
        Object.getPrototypeOf = function(obj)
        {
            return obj.__proto__ || obj.prototype || (obj.constructor && obj.constructor.prototype) || Object.prototype;
        };
    }

    /**
     * Judge an object is a plain object
     * @param  {object}  obj
     * @return {Boolean}
     */
    if(!Object.isPlainObject)
    {
        Object.isPlainObject = function(obj)
        {
            return obj != null && typeof(obj) == "object" && Object.getPrototypeOf(obj) == Object.prototype;
        };
    }

    /**
     * Extend object attribute from another one
     */
    if(!Object.extend)
    {
        Object.extend = function(target, source, deep)
        {
            if (!target)
            {
                target = {};
            }
            if (!source)
            {
                source = {};
            }
            for (var key in source)
            {
                if (source[key] !== undefined)
                {
                    if (deep && typeof target[key] === 'object')
                    {
                        Object.extend(target[key], source[key], deep);
                    }
                    else
                    {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };
    }
}());

(function()
{
    'use strict';

    /**
     * Format string
     *
     * @param  object|array args
     * @return string
     */
    String.prototype.format = function(args)
    {
        var result = this;
        if (arguments.length > 0)
        {
            var reg;
            if (arguments.length == 1 && typeof(args) == "object")
            {
                for (var key in args)
                {
                    if (args[key] != undefined)
                    {
                        reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            }
            else
            {
                for (var i = 0; i < arguments.length; i++)
                {
                    if (arguments[i] != undefined)
                    {
                        reg = new RegExp("({[" + i + "]})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    };

    /**
     * Judge the string is a integer number
     *
     * @return bool
     */
    String.prototype.isNum = function(s)
    {
        if (s != null)
        {
            var r, re;
            re = /\d*/i;
            r = s.match(re);
            return (r == s) ? true : false;
        }
        return false;
    };

    /**
     * Judge the string is start with this string
     *
     * @param  {string} str
     * @return {boolean}
     */
    String.prototype.startWith = function(str)
    {
        return this.indexOf(str) === 0;
    };

    /**
     * Judge the string is end with this string
     *
     * @param  {string} str
     * @return {boolean}
     */
    String.prototype.endWith = function(s)
    {
        var d = this.length - s.length;
        return (d >= 0 && this.lastIndexOf(s) == d);
    };

    /**
     * Convert first letter of the string to upper case
     *
     * @return {string}
     */
    String.prototype.upperCaseFirstLetter = function()
    {
        if (this.length > 1) return this.substring(0, 1).toUpperCase() + this.substring(1);
        else return this.toUpperCase();
    };

    /**
     * Replace all the same part with the given string
     * @param  {string} s1 the old string part
     * @param  {string} s2 the new string part
     * @return {string}
     */
    String.prototype.replaceAll = function(s1, s2)
    {
        return this.replace(new RegExp(s1, "gm"), s2);
    };

    /**
     * Remove space from start and end
     * @return {string}
     */
    if (!String.prototype.trim)
    {
        String.prototype.trim = function()
        {
            var reExtraSpace = /^\s*(.*?)\s+$/;
            return this.replace(reExtraSpace, "$1");
        };
    }

    /**
     * Encode to html
     * @return {string}
     */
    String.prototype.encodeHtml = function()
    {
        return this.replace(/&/g, '&').replace(/\"/g, '"').replace(/</g, '<').replace(/>/g, '>');
    };

    /**
     * Judge an string is an url
     * @return {Boolean}
     */
    String.prototype.isURL = function()
    {
        var regular = /^\b(((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|asia|coop|aero|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?)$/i
        if (regular.test(this))
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    /**
     * Convert the version string to an number can be compare to other one
     * @return {number}
     */
    String.prototype.version2Number = function()
    {
        var ver = this;
        ver = ver.split('.', 3);
        var num = '';
        for(var i = 0; i < ver.length; i++)
        {
            var v = ver[i];
            while(v.length < 4)
            {
                v += '0';
            }
            num += v;
        }
        while(num.length < 12)
        {
            num += '0';
        }
        return parseInt(num);
    };
}());

/**
 * Array extensions.
 * @return {undefined}
 */
(function()
{
    'use strict';

    /**
     *  Calls a function for each element in the array.
     */
    if (!Array.prototype.forEach)
    {
        Array.prototype.forEach = function(fun /*, thisp*/ )
        {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();

            var thisp = arguments[1],
                result;
            for (var i = 0; i < len; i++)
            {
                if (i in this)
                {
                    result = fun.call(thisp, this[i], i, this);
                    if (result === false)
                    {
                        break;
                    }
                }
            }
        };
    }

    /**
     * Judge an object is an real array
     */
    if (!Array.isArray)
    {
        Array.isArray = function(obj)
        {
            return Object.toString.call(obj) === '[object Array]';
        }
    };

    /**
     * Returns the last (greatest) index of an element within the array equal to the specified value, or -1 if none is found.
     */
    if (!Array.prototype.lastIndexOf)
    {
        Array.prototype.lastIndexOf = function(elt /*, from*/ )
        {
            var len = this.length;

            var from = Number(arguments[1]);
            if (isNaN(from))
            {
                from = len - 1;
            }
            else
            {
                from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                if (from < 0)
                    from += len;
                else if (from >= len)
                    from = len - 1;
            }

            for (; from > -1; from--)
            {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    /**
     * Returns true if every element in this array satisfies the provided testing function.
     */
    if (!Array.prototype.every)
    {
        Array.prototype.every = function(fun /*, thisp*/ )
        {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();

            var thisp = arguments[1];
            for (var i = 0; i < len; i++)
            {
                if (i in this &&
                    !fun.call(thisp, this[i], i, this))
                    return false;
            }

            return true;
        };
    }

    /**
     * Creates a new array with all of the elements of this array for which the provided filtering function returns true.
     */
    if (!Array.prototype.filter)
    {
        Array.prototype.filter = function(fun /*, thisp*/ )
        {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();

            var res = new Array();
            var thisp = arguments[1];
            for (var i = 0; i < len; i++)
            {
                if (i in this)
                {
                    var val = this[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, this))
                        res.push(val);
                }
            }

            return res;
        };
    }

    /**
     * Returns the first (least) index of an element within the array equal to the specified value, or -1 if none is found.
     */
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function(elt /*, from*/ )
        {
            var len = this.length;

            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++)
            {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    };

    /**
     * Creates a new array with the results of calling a provided function on every element in this array.
     */
    if (!Array.prototype.map)
    {
        Array.prototype.map = function(fun /*, thisp*/ )
        {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();

            var res = new Array(len);
            var thisp = arguments[1];
            for (var i = 0; i < len; i++)
            {
                if (i in this)
                    res[i] = fun.call(thisp, this[i], i, this);
            }

            return res;
        };
    }

    /**
     * Creates a new array with the results match the condistions
     * @param  {plain object or function} conditions
     * @param  {array} result 
     * @return {array}      
     */
    Array.prototype.where = function(conditions, result)
    {
        result = result || [];
        var cdt, ok, objVal;
        this.forEach(function(val)
        {
            ok = true;
            for (var key in conditions)
            {
                cdt = conditions[key];
                if (typeof cdt === 'function')
                {
                    ok = cdt(val);
                }
                else
                {
                    objVal = val[key];
                    ok = (objVal && objVal === cdt);
                }
                if (!ok) break;
            }
            if (ok) result.push(val);
        });

        return result;
    };

    /**
     * Return a object contains grouped result as object key
     * @param  {string} key
     * @return {Object} 
     */
    Array.prototype.groupBy = function(key)
    {
        var result = {};
        this.forEach(function(val)
        {
            var keyName = val[key];
            if (!keyName)
            {
                keyName = 'unkown';
            }

            if (!result[keyName])
            {
                result[keyName] = [];
            }
            result[keyName].push(val);
        });
        return result;
    }

    /**
     * Returns true if at least one element in this array satisfies the provided testing conditions.
     * @param  {function or plain object}  conditions
     * @return {Boolean} 
     */
    Array.prototype.has = function(conditions)
    {
        var result = false,
            cdt, ok, objVal;
        this.forEach(function(val)
        {
            ok = true;
            for (var key in conditions)
            {
                cdt = conditions[key];
                if (typeof cdt === 'function')
                {
                    ok = cdt(val);
                }
                else
                {
                    objVal = val[key];
                    ok = (objVal && objVal === cdt);
                }
                if (!ok) break;
            }
            if (ok)
            {
                result = true;
                return false;
            }
        });

        return result;
    };
}());

(function()
{
    'use strict';

    Date.ONEDAY_TICKS = 24 * 3600 * 1000;
    Date.WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    /**
     * Format date to a string
     *
     * @param  string   format
     * @return string
     */
    Date.prototype.format = function(format)
    {
        var date = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S+": this.getMilliseconds()
        };
        if (/(y+)/i.test(format))
        {
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date)
        {
            if (new RegExp("(" + k + ")").test(format))
            {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    };

    /**
     * Descript date with friendly way
     * @return {string}
     */
    Date.prototype.friendlyStr = function()
    {
        var date = this,
            curDate = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 10,
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            curYear = curDate.getFullYear(),
            curHour = curDate.getHours(),
            timeStr;
     
        if(year < curYear){
            timeStr = year +'年'+ month +'月'+ day +'日 '+ hour +':'+ minute;
        }else{
            var pastTime = curDate - date,
                pastH = pastTime/3600000;
     
            if(pastH > curHour){
                  timeStr = month +'月'+ day +'日 '+ hour +':'+ minute;
            }else if(pastH >= 1){
                  timeStr = '今天 ' + hour +':'+ minute +'分';
            }else{
                  var pastM = curDate.getMinutes() - minute;
                  if(pastM > 1){
                    timeStr = pastM +'分钟前';
                  }else{
                    timeStr = '刚刚';
                  }
            }
        }
        return timeStr;
    }

    /**
     * Get week day name of the date
     * @param  {array} weekdayNames(optional)
     * @return {string}
     */
    Date.prototype.getDayName = function(weekdayNames)
    {
        weekdayNames = weekdayNames || Date.WEEKDAY_NAMES;
        return weekdayNames[this.getDay()];
    };

    /**
     * Add milliseconds to the date
     * @param {number} value
     */
    Date.prototype.addMilliseconds = function(value)
    {
        this.setTime(this.getTime() + value);
        return this;
    };

    /**
     * Add days to the date
     * @param {number} days
     */
    Date.prototype.addDays = function(days)
    {
        this.addMilliseconds(days * Date.ONEDAY_TICKS);
        return this;
    };

    /**
     * Clone a new date instane from the date
     * @return {Date}
     */
    Date.prototype.clone = function()
    {
        var date = new Date();
        date.setTime(this.getTime());
        return date;
    };

    /**
     * Judge the year is in a leap year
     * @param  {integer}  year
     * @return {Boolean}
     */
    Date.isLeapYear = function(year)
    {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    };

    /**
     * Get days number of the date
     * @param  {integer} year
     * @param  {integer} month
     * @return {integer}
     */
    Date.getDaysInMonth = function(year, month)
    {
        return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    };

    /**
     * Judge the date is in a leap year
     * @return {Boolean}
     */
    Date.prototype.isLeapYear = function()
    {
        return Date.isLeapYear(this.getFullYear());
    };

    /**
     * Parse date from name
     * @param  {string} name
     * @return {date}
     */
    Date.parseName = function(name)
    {
        var date = new Date();
        switch (name)
        {
            case 'now':
                break;
            case 'today':
                date.clearTime();
                break;
            case 'yestoday':
                date.clearTime().addDays(-1);
                break;
            case 'thisweek':
                date = date.getLastWeekday();
                break;
            case 'lastweek':
                date = date.getLastWeekday().addDays(-7);
                break;
            case 'thisyear':
                date.clearTime();
                date.setMonth(1);
                date.setDate(1);
                break;
        }
        return date;
    };

    /**
     * Clear time part of the date
     * @return {date}
     */
    Date.prototype.clearTime = function()
    {
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
        return this;
    };

    /**
     * Get days of this month of the date
     * @return {integer}
     */
    Date.prototype.getDaysInMonth = function()
    {
        return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
    };

    /**
     * Add months to the date
     * @param {date} value
     */
    Date.prototype.addMonths = function(value)
    {
        var n = this.getDate();
        this.setDate(1);
        this.setMonth(this.getMonth() + value);
        this.setDate(Math.min(n, this.getDaysInMonth()));
        return this;
    };

    /**
     * Get last week day of the date
     * @param  {integer} day
     * @return {date}
     */
    Date.prototype.getLastWeekday = function(day)
    {
        day = day || 1;

        var d = this.clone();
        while (d.getDay() != day)
        {
            d.addDays(-1);
        }
        d.clearTime();
        return d;
    };

    /**
     * Judge the date is same day as another date
     * @param  {date}  date
     * @return {Boolean}
     */
    Date.prototype.isSameDay = function(date)
    {
        return date.toDateString() === this.toDateString();
    };

    /**
     * Judge the date is in same week as another date
     * @param  {date}  date
     * @return {Boolean}
     */
    Date.prototype.isSameWeek = function(date)
    {
        var weekStart = this.getLastWeekday();
        var weekEnd = weekStart.clone().addDays(7);
        return date >= weekStart && date < weekEnd;
    };

    /**
     * Judge the date is in same year as another date
     * @param  {date}  date
     * @return {Boolean}
     */
    Date.prototype.isSameYear = function(date)
    {
        return this.getFullYear() === date.getFullYear();
    };
}());

(function()
{
    "use strict";

    /**
     * Event drawer class
     */
    var EventDrawer = function()
    {
        this.eventDrawer = {};
    };

    /**
     * Get event name without namespace
     * @param  {string} et  event name
     * @return {string}
     */
    EventDrawer.getEventName = function(et)
    {
        var dotIndex = et.indexOf('.');
        if(dotIndex > 0)
        {
            return et.substr(0, dotIndex);
        }
        return et;
    };

    /**
     * Trigger an event
     * @param  {string} e  event name
     * @param  {object} pramas
     * @param  {object} proxy
     * @return {object}
     */
    EventDrawer.prototype.trigger = function(e, pramas, proxy)
    {
        var name   = EventDrawer.getEventName(e);
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
                    result = proxy ? et.fn.call(proxy, pramas) : et.fn(pramas);
                }
            };
        }
        return result;
    };

    /**
     * Unbind event
     * @param  {string} e
     * @return {object}   EventDrawer self
     */
    EventDrawer.prototype.off = function(e)
    {
        var name   = EventDrawer.getEventName(e);
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

    /**
     * Bind event
     * @param  {string}   e 
     * @param  {Function} fn
     * @return {object}   EventDrawer self
     */
    EventDrawer.prototype.on = function(e, fn)
    {
        var name = EventDrawer.getEventName(e);
        if(!this.eventDrawer[name])
        {
            this.eventDrawer[name] = [];
        }
        this.eventDrawer[name].push({name: e, fn: fn});
        return this;
    };

    window.EventDrawer = EventDrawer;
}());

/**
 * JSON Date Extensions - JSON date parsing extensions
 * 
 * (c) 2014 Rick Strahl, West Wind Technologies
 *
 * Released under MIT License
 * http://en.wikipedia.org/wiki/MIT_License
 */
(function(undefined) {
    if (this.JSON && !this.JSON.dateParser) {
        var reISO    = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

        /// <summary>
        /// set this if you want MS Ajax Dates parsed
        /// before calling any of the other functions
        /// </summary>
        JSON.parseMsAjaxDate = false;

        JSON.useDateParser = function(reset) {
            /// <summary>
            /// Globally enables JSON date parsing for JSON.parse().
            /// Replaces the default JSON.parse() method and adds
            /// the datePaser() extension to the processing chain.
            /// </summary>    
            /// <param name="reset" type="bool">when set restores the original JSON.parse() function</param>

            // if any parameter is passed reset
            if (reset != undefined) {
                if (JSON._parseSaved) {
                    JSON.parse = JSON._parseSaved;
                    JSON._parseSaved = null;
                }
            } else {
                if (!JSON._parseSaved) {
                    JSON._parseSaved = JSON.parse;
                    JSON.parse = JSON.parseWithDate;
                }
            }
        };

        /// <summary>
        /// Creates a new filter that processes dates and also delegates to a chain filter optionaly.
        /// </summary>    
        /// <param name="chainFilter" type="Function">property name that is parsed</param>
        /// <returns type="Function">returns a new chainning filter for dates</returns>
        function createDateParser(chainFilter) {
            return function(key, value) {
                var parsedValue = value;
                if (typeof value === 'string') {
                    var a = reISO.exec(value);
                    if (a) {
                        parsedValue = new Date(value);
                    } else if (JSON.parseMsAjaxDate) {
                        a = reMsAjax.exec(value);
                        if (a) {
                            var b = a[1].split(/[-+,.]/);
                            parsedValue = new Date(b[0] ? +b[0] : 0 - +b[1]);
                        }
                    }
                }
                if (chainFilter !== undefined)
                    return chainFilter(key, parsedValue);
                else
                    return parsedValue;
            };
        }

        /// <summary>
        /// A filter that can be used with JSON.parse to convert dates.
        /// </summary>    
        /// <param name="key" type="string">property name that is parsed</param>
        /// <param name="value" type="any">property value</param>
        /// <returns type="date">returns date or the original value if not a date string</returns>
        JSON.dateParser = createDateParser();

        JSON.parseWithDate = function(json, chainFilter) {
            /// <summary>
            /// Wrapper around the JSON.parse() function that adds a date
            /// filtering extension. Returns all dates as real JavaScript dates.
            /// </summary>    
            /// <param name="json" type="string">JSON to be parsed</param>
            /// <returns type="any">parsed value or object</returns>
            var parse = JSON._parseSaved ? JSON._parseSaved : JSON.parse;
            try {
                var res = parse(json, createDateParser(chainFilter));
                return res;
            } catch (e) {
                // orignal error thrown has no error message so rethrow with message
                throw new Error("JSON content could not be parsed");
            }
        };

        JSON.dateStringToDate = function(dtString, nullDateVal) {
            /// <summary>
            /// Converts a JSON ISO or MSAJAX date or real date a date value.
            /// Supports both JSON encoded dates or plain date formatted strings
            /// (without the JSON string quotes).
            /// If you pass a date the date is returned as is. If you pass null
            /// null or the nullDateVal is returned.
            /// </summary>    
            /// <param name="dtString" type="var">Date String in ISO or MSAJAX format</param>
            /// <param name="nullDateVal" type="var">value to return if date can't be parsed</param>
            /// <returns type="date">date or the nullDateVal (null by default)</returns> 
            if (!nullDateVal)
                nullDateVal = null;
            
            if (!dtString)
                return nullDateVal; // empty

            if (dtString.getTime)
                return dtString; // already a date
            
            if (dtString[0] === '"' || dtString[0] === "'")
                // strip off JSON quotes
                dtString = dtString.substr(1, dtString.length - 2);

            var a = reISO.exec(dtString);
            if (a)
                return new Date(dtString);

            if (!JSON.parseMsAjaxDate)
                return nullDateVal;

            a = reMsAjax.exec(dtString);
            if (a) {
                var b = a[1].split(/[-,.]/);
                return new Date(+b[0]);
            }
            return nullDateVal;
        };
    }
})();


(function()
{
    JSON.useDateParser();

    var lsName = 'localStorage';
    var storage = window[lsName],
        old = window.store;

    /* The Store object */
    var Store = function() {
        this.slience = true;
        this.enable = (lsName in window) && window[lsName] && window[lsName]['setItem'];
        this.storage = storage;
    };

    /* Set storage */
    Store.prototype.setStorage = function(st) {
        if (st && st.getLength) {
            this.enable = true;
            storage = st;
            this.storage = st;
        }
        return this;
    };

    /* Check enable status */
    Store.prototype.check = function() {
        if (!this.enable) {
            if (!this.slience) throw new Error('Browser not support localStorage or enable status been set true.');
        }
        return this.enable;
    };

    /* Get length */
    Store.prototype.length = function() {
        if (this.check()) {
            return storage.getLength ? storage.getLength() : storage.length;
        }
        return 0;
    };

    /* Remove item with browser localstorage native method */
    Store.prototype.removeItem = function(key) {
        storage.removeItem(key);
        return this;
    };

    /* Remove item with browser localstorage native method, same as removeItem */
    Store.prototype.remove = function(key) {
        return this.removeItem(key);
    };

    /* Get item value with browser localstorage native method, and without deserialize */
    Store.prototype.getItem = function(key) {
        return storage.getItem(key);
    };

    /* Get item value and deserialize it, if value is null and defaultValue been given then return defaultValue */
    Store.prototype.get = function(key, defaultValue) {
        var val = this.deserialize(this.getItem(key));
        return (defaultValue !== undefined && (typeof val === 'undefined' || val === null || val === undefined)) ? defaultValue : val;
    };

    /* Get item key by index and deserialize it */
    Store.prototype.key = function(index) {
        return storage.key(index);
    };

    /* Set item value with browser localstorage native method, and without serialize filter */
    Store.prototype.setItem = function(key, val) {
        storage.setItem(key, val);
        return this;
    };

    /* Set item value, serialize it if the given value is not an string */
    Store.prototype.set = function(key, val) {
        if (val === undefined) return this.remove(key);
        this.setItem(key, this.serialize(val));
        console.groupCollapsed('%cSTORE SET: ' + key, 'color: purple; border-left: 10px solid orange; padding-left: 5px;font-size: 14px; font-weight: bold;');
        console.log(val);
        console.log('JSON:', this.serialize(val));
        console.groupEnd();
        return this;
    };

    /* Clear all items with browser localstorage native method */
    Store.prototype.clear = function() {
        storage.clear();
        return this;
    };

    /* Iterate all items with callback */
    Store.prototype.forEach = function(callback) {
        for (var i = storage.length - 1; i >= 0; i--) {
            var key = storage.key(i);
            callback(key, this.get(key));
        }
        return this;
    };

    /* Get all items and set value in an object. */
    Store.prototype.getAll = function() {
        var all = {};
        this.forEach(function(key, val) {
            all[key] = val;
        });

        return all;
    };

    /* Serialize value with JSON.stringify */
    Store.prototype.serialize = function(value) {
        if (typeof value === 'string') return value;
        return JSON.stringify(value);
    };

    /* Deserialize value, with JSON.parse if the given value is not a string */
    Store.prototype.deserialize = function(value) {
        if (typeof value !== 'string') return undefined;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value || undefined;
        }
    };

    if(!window.store)
    {
        window.store = new Store();
    }

    window.store.noConflict = function() {
        window.store = old;
        return window.store;
    };
}());

(function()
{
    'use strict';

    var forEach = Array.prototype.forEach;

    /**
     * Gesture preventDefault
     * @param {type} e
     * @returns {undefined}
     */
    window.preventDefault = function(e)
    {
        e.preventDefault();
    };

    /**
     * Gesture stopPropagation
     * @param {type} e
     * @returns {undefined}
     */
    window.stopPropagation = function(e)
    {
        e.stopPropagation();
    };

    /**
     * forEach for NodeList
     * @type {[type]}
     */
    NodeList.prototype.forEach = forEach;

    /**
     * Bind event on node or the window object
     * @param  {string}   event
     * @param  {Function} fn
     * @return {Node}     or window
     */
    window.on = function(event, fn)
    {
        this.addEventListener(event, fn, false);
        return this;
    };

    /**
     * Bind event on all node in NodeList or the window object
     * @param  {string}   event
     * @param  {Function} fn
     * @return {NodeList}
     */
    NodeList.prototype.on = function(event, fn)
    {
        forEach.call(this, function(el)
        {
            el.on(event, fn);
        });
        return this;
    };

    /**
     * Custom event object
     * @type {object}
     */
    if (!window.CustomEvent)
    {
        var CustomEvent = function(event, params)
        {
            params = params ||
            {
                bubbles: false,
                cancelable: false,
                detail: undefined
            };
            var evt = document.createEvent('Events');
            var bubbles = true;
            if (params)
            {
                for (var name in params)
                {
                    (name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
                }
            }
            evt.initEvent(event, bubbles, true);
            return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    /**
     * Trigger event on element
     * @param  {object} element
     * @param  {string} eventType
     * @param  {object} eventData
     * @return {void}
     */
    window.trigger = function(element, eventType, eventData)
    {
        if(typeof element === 'string')
        {
            eventType = element;
            eventData = eventType;
            element = window;
        }

        console.groupCollapsed('%cTRIGGER: ' + eventType, 'color: #fff; background-color: orange;');
        console.log('element', element);
        console.log('eventData', eventData);
        console.groupEnd();
        var event = new window.CustomEvent(eventType,
        {
            detail: eventData,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);

        return element;
    };

    /**
     * Trigger event, data optional
     * @param  {string}  type
     * @param  {anytype} data optional
     * @return {node}    or window
     */
    Node.prototype.trigger = function(type, data)
    {
        window.trigger(this, type, data);
    };

    /**
     * Trigger event on all node in NodeList
     * @param  {string}   type
     * @return {NodeList}
     */
    NodeList.prototype.trigger = function(event)
    {
        forEach.call(this, function(el)
        {
            el.trigger(event);
        });
        return this;
    };

    var div = document.createElement("div"),
    prefix = ["moz", "webkit", "ms", "o"].filter(function(prefix)
    {
        return prefix + "MatchesSelector" in div;
    })[0] + "MatchesSelector";

    /**
     * Bind event on Element object, delegate optional
     * @param {string}   type
     * @param {string}   or {function}   selector or function
     * @param {Function} fn  optional
     */
    document.on = 
    Element.prototype.on = 
    Element.prototype.addDelegateListener = function(type, selector, fn)
    {
        console.groupCollapsed('%cON: ' + type, 'color: #fff; background-color: orange;');
        console.log('element', this);
        console.log('selector', selector);
        console.log('fn', fn);

        if(typeof selector === 'function')
        {
            console.log('delegate', false);
            this.addEventListener(type, selector, false);
        }
        else if(typeof fn === 'function')
        {
            console.log('delegate', true);
            this.addEventListener(type, function(e)
            {
                var target = e.target;

                while (target && target !== this && !target[prefix](selector))
                {
                    target = target.parentNode;
                }

                if (target && target !== this)
                {
                    return fn.call(target, e);
                }

            }, false);
        }

        //click event preventDefault
        this.removeEventListener('click.touchable', window.preventDefault);
        this.addEventListener('click.touchable', window.preventDefault);

        console.groupEnd();
        return this;
    };

    /**
     * Get view port of document
     * @return {object}
     */
    window.getViewport = function()
    {
        if (document.compatMode == "BackCompat")
        {　　　　　　
            return {　　　　　　　　
                width  : document.body.clientWidth,
                height : document.body.clientHeight　　　　　　
            };
        }
        else
        {　　　　　　
            return {　　　　　　　　
                width  : document.documentElement.clientWidth,
                height : document.documentElement.clientHeight　　　　　　
            };　　　　
        }　　
    };

    /**
     * Get scroll left offset
     * @return {number}
     */
    window.getScrollLeft = function()
    {
        return (document.compatMode == "BackCompat") ?
            document.body.scrollLeft : 
            document.documentElement.scrollLeft;
    };

    /**
     * Get scroll top offset
     * @return {number}
     */
    window.getScrollTop = function()
    {
        return (document.compatMode == "BackCompat") ?
            document.body.scrollTop : 
            document.documentElement.scrollTop;
    };

    /**
     * Get scroll offset
     * @return {object}
     */
    window.getScrollPosition = function()
    {
        return (document.compatMode == "BackCompat") ?
            {x: document.body.scrollLeft, y: document.body.scrollTop} : 
            {x: document.documentElement.scrollLeft, y: document.documentElement.scrollTop};
    };

    /**
     * Scroll to top position smoothly.
     * @param  {number}   scrollTop
     * @param  {number}   duration
     * @param  {Function} callback
     * @return {void}        
     */
    window.scrollToSmooth = function(scrollTop, duration, callback)
    {
        duration = duration || 1000;
        var scroll = function(duration)
        {
            if (duration <= 0)
            {
                callback && callback();
                return;
            }
            var distaince = scrollTop - window.scrollY;
            setTimeout(function()
            {
                window.scrollTo(0, window.scrollY + distaince / duration * 10);
                scroll(duration - 10);
            }, 16.7);
        };
        scroll(duration);
    }

    /**
     * Get left offset from page
     * @return {number}
     */
    Element.prototype.getPageLeft = function()
    {
        var actualLeft = this.offsetLeft;　　　　
        var current = this.offsetParent;　　　　
        while (current !== null)
        {　　　　　　
            actualLeft += current.offsetLeft;　　　　　　
            current = current.offsetParent;　　　　
        }　　　　
        return actualLeft;
    };

    /**
     * Get top offset from page
     * @return {number}
     */
    Element.prototype.getPageTop = function()
    {
        var actualTop = this.offsetTop;　　　　
        var current = this.offsetParent;　　　　
        while (current !== null)
        {　　　　　　
            actualTop += current.offsetTop;　　　　　　
            current = current.offsetParent;　　　　
        }　　　　
        return actualTop;　　
    };

    /**
     * Get page offset
     * @return {object}
     */
    Element.prototype.getPageOffset = function()
    {
        var offset = {top: this.offsetTop, left: this.offsetLeft};　　　　
        var current = this.offsetParent;　　　　
        while (current !== null)
        {　　　　　　
            offset.top += current.offsetTop;　　　　　　
            offset.left += current.offsetLeft;　　　　　　
            current = current.offsetParent;　　　　
        }　　　　
        return offset;　　
    };

    /**
     * Get left offset from view area
     * @return {number}
     */
    Element.prototype.getViewLeft = function()
    {　　　　
        return this.getPageLeft() - window.getScrollLeft();　　
    };

    /**
     * Get top offset from view area
     * @return {number}
     */
    Element.prototype.getViewTop = function()
    {　　　　
        return this.getPageTop() - window.getScrollTop();　　
    };

    /**
     * Get offset from view area
     * @return {number}
     */
    Element.prototype.getViewOffset = function()
    {　　　　
        var offset = this.getPageOffset();
        offset.top  -= window.getScrollTop();
        offset.left -= window.getScrollLeft();
        return offset;
    };

    /**
     * Get styles of the element
     * @param  {string} property
     * @return {string}
     */
    Element.prototype.getStyles = function(property)
    {
        var styles = this.ownerDocument.defaultView.getComputedStyle(this, null);
        if (property)
        {
            return styles.getPropertyValue(property) || styles[property];
        }
        return styles;
    };

    /**
     * Put callback to document ready
     * @param {Function} callback
     */
    var readyRE = /complete|loaded|interactive/;
    document.ready = function(callback)
    {
        if (readyRE.test(document.readyState))
        {
            callback();
        }
        else
        {
            document.addEventListener('DOMContentLoaded', function()
            {
                callback();
            }, false);
        }
    };

    document.$id = function(id, context)
    {
        return (context || document).getElementById(id);
    };

    document.$class = function(className, context)
    {
        return (context || document).getElementsByClassName(className);
    };

    document.$tag = function(tag, context)
    {
        return (context || document).getElementsByTagName(tag);
    };

    var idSelectorRE = /^#([\w-]*)$/;
    var classSelectorRE = /^\.([\w-]+)$/;
    var tagSelectorRE = /^[\w-]+$/;
    document.$ = function(selector, context)
    {
        if(idSelectorRE.test(selector))
        {
            return document.getElementById(RegExp.$1);
        }

        context = context || document;
        var result = classSelectorRE.test(selector) ? context.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);

        return (result && result.length == 1) ? result[0] : result;
    };

    Node.prototype.$ = function(selector)
    {
        return document.$(selector, this);
    }
}());

/**
 * mui gestures
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function(window)
{
    var EVENT_START = 'touchstart';
    var EVENT_MOVE = 'touchmove';
    var EVENT_END = 'touchend';
    var EVENT_CANCEL = 'touchcancel';
    var EVENT_CLICK = 'click';

    if (!window.gestureConfig)
    {
        window.gestureConfig = {
            tap: true,
            doubletap: false,
            longtap: false,
            flick: true,
            swipe: true,
            drag: true
        };
    }

    /**
     * Gesture functions
     */
    var gestures = [];

    /**
     * register gesture
     * @param {type} gesture
     * @returns {gestures}
     */
    var registerGesture = function(gesture)
    {
        gesture.index = gesture.index || 1000;

        gestures.push(gesture);

        gestures.sort(function(a, b)
        {
            return a.index - b.index;
        });
        return gestures;
    };

    /**
     * distance
     * @param {type} p1
     * @param {type} p2
     * @returns {Number}
     */
    var getDistance = function(p1, p2)
    {
        var x = p2.x - p1.x;
        var y = p2.y - p1.y;
        return Math.sqrt((x * x) + (y * y));
    };

    /**
     * angle
     * @param {type} p1
     * @param {type} p2
     * @returns {Number}
     */
    var getAngle = function(p1, p2)
    {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    };

    /**
     * direction
     * @param {type} angle
     * @returns {unresolved}
     */
    var getDirectionByAngle = function(angle)
    {
        if (angle < -45 && angle > -135)
        {
            return 'up';
        }
        else if (angle >= 45 && angle < 135)
        {
            return 'down';
        }
        else if (angle >= 135 || angle <= -135)
        {
            return 'left';
        }
        else if (angle >= -45 && angle <= 45)
        {
            return 'right';
        }
        return null;
    };

    /**
     * detect gestures
     * @param {type} event
     * @param {type} touch
     * @returns {undefined}
     */
    var detect = function(event, touch)
    {
        if (gestures.stoped)
        {
            return;
        }
        gestures.forEach(function(gesture)
        {
            if (!gestures.stoped)
            {
                if (window.gestureConfig[gesture.name] !== false)
                {
                    if (gesture.hasOwnProperty('handle'))
                    {
                        gesture.handle(event, touch);
                    }
                }
            }
        });
    };

    var touch = {};
    var detectTouchStart = function(event)
    {
        gestures.stoped = false;
        var now = Date.now();
        var point = event.touches ? event.touches[0] : event;
        touch = {
            target: event.target,
            lastTarget: (touch.lastTarget ? touch.lastTarget : null),
            startTime: now,
            touchTime: 0,
            flickStartTime: now,
            lastTapTime: (touch.lastTapTime ? touch.lastTapTime : 0),
            start:
            {
                x: point.pageX,
                y: point.pageY
            },
            flickStart:
            {
                x: point.pageX,
                y: point.pageY
            },
            flickDistanceX: 0,
            flickDistanceY: 0,
            move:
            {
                x: 0,
                y: 0
            },
            deltaX: 0,
            deltaY: 0,
            lastDeltaX: 0,
            lastDeltaY: 0,
            angle: '',
            direction: '',
            distance: 0,
            drag: false,
            swipe: false,
            gesture: event
        };

        detect(event, touch);
    };

    var detectTouchMove = function(event)
    {
        if (gestures.stoped)
        {
            return;
        }
        var now = Date.now();
        var point = event.touches ? event.touches[0] : event;
        touch.touchTime = now - touch.startTime;
        touch.move = {
            x: point.pageX,
            y: point.pageY
        };
        if (now - touch.flickStartTime > 300)
        {
            touch.flickStartTime = now;
            touch.flickStart = touch.move;
        }
        touch.distance = getDistance(touch.start, touch.move);
        touch.angle = getAngle(touch.start, touch.move);
        touch.direction = getDirectionByAngle(touch.angle);
        touch.lastDeltaX = touch.deltaX;
        touch.lastDeltaY = touch.deltaY;
        touch.deltaX = touch.move.x - touch.start.x;
        touch.deltaY = touch.move.y - touch.start.y;
        touch.gesture = event;

        detect(event, touch);
    };

    var detectTouchEnd = function(event)
    {
        if (gestures.stoped)
        {
            return;
        }
        var now = Date.now();
        touch.touchTime = now - touch.startTime;
        touch.flickTime = now - touch.flickStartTime;
        touch.flickDistanceX = touch.move.x - touch.flickStart.x;
        touch.flickDistanceY = touch.move.y - touch.flickStart.y;
        touch.gesture = event;

        detect(event, touch);
    };

    window.addEventListener(EVENT_START, detectTouchStart);
    window.addEventListener(EVENT_MOVE, detectTouchMove);
    window.addEventListener(EVENT_END, detectTouchEnd);
    window.addEventListener(EVENT_CANCEL, detectTouchEnd);

    //fixed hashchange(android)
    window.addEventListener(EVENT_CLICK, window.preventDefault);

    /**
     * mui gesture flick[left|right|up|down]
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'flick',
        index: 5,
        options:
        {
            flickMaxTime: 300,
            flickMinDistince: 10
        },
        handle: function(event, touch)
        {
            if (event.type === EVENT_END || event.type === EVENT_CANCEL)
            {
                var options = this.options;
                if (touch.direction && options.flickMaxTime > touch.flickTime && touch.distance > options.flickMinDistince)
                {
                    touch.flick = true;
                    window.trigger(event.target, 'flick', touch);
                    window.trigger(event.target, 'flick' + touch.direction, touch);
                }
            }
        }
    });

    /**
     * mui gesture swipe[left|right|up|down]
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'swipe',
        index: 10,
        options:
        {
            swipeMaxTime: 300,
            swipeMinDistince: 18
        },
        handle: function(event, touch)
        {
            if (event.type === EVENT_END || event.type === EVENT_CANCEL)
            {
                var options = this.options;
                if (touch.direction && options.swipeMaxTime > touch.touchTime && touch.distance > options.swipeMinDistince)
                {
                    touch.swipe = true;
                    window.trigger(event.target, 'swipe' + touch.direction, touch);
                }
            }
        }
    });

    /**
     * mui gesture drag[start|left|right|up|down|end]
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'drag',
        index: 20,
        options:
        {},
        handle: function(event, touch)
        {
            switch (event.type)
            {
                case EVENT_MOVE:
                    if (touch.direction)
                    { //drag
                        if (!touch.drag)
                        {
                            touch.drag = true;
                            window.trigger(event.target, 'dragstart', touch);
                        }
                        window.trigger(event.target, 'drag', touch);
                        window.trigger(event.target, 'drag' + touch.direction, touch);
                    }
                    break;
                case EVENT_END:
                case EVENT_CANCEL:
                    if (touch.drag)
                    {
                        window.trigger(event.target, 'dragend', touch);
                    }
                    break;
            }
        }
    });

    /**
     * mui gesture tap and doubleTap
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'tap',
        index: 30,
        options:
        {
            tapMaxInterval: 300,
            tapMaxDistance: 5,
            tapMaxTime: 250
        },
        handle: function(event, touch)
        {
            //if (event.type === EVENT_END || event.type === EVENT_CANCEL) {
            if (event.type === EVENT_END)
            { //ignore touchcancel
                var options = this.options;
                if (touch.distance < options.tapMaxDistance && touch.touchTime < options.tapMaxTime)
                {
                    if (window.gestureConfig.doubletap && touch.lastTarget && (touch.lastTarget === event.target))
                    { //same target
                        if (touch.lastTapTime && (touch.startTime - touch.lastTapTime) < options.tapMaxInterval)
                        {
                            window.trigger(event.target, 'doubletap', touch);
                            touch.lastTapTime = Date.now();
                            touch.lastTarget = event.target;
                            return;
                        }
                    }
                    window.trigger(event.target, 'tap', touch);
                    touch.lastTapTime = Date.now();
                    touch.lastTarget = event.target;
                }
            }
        }
    });

    /**
     * mui gesture longtap
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'longtap',
        index: 10,
        options:
        {
            holdTimeout: 500,
            holdThreshold: 2
        },
        handle: function(event, touch)
        {
            var options = this.options;
            switch (event.type)
            {
                case EVENT_START:
                    clearTimeout(timer);
                    timer = setTimeout(function()
                    {
                        if (!touch.drag)
                        {
                            window.trigger(event.target, 'longtap', touch);
                        }
                    }, options.holdTimeout);
                    break;
                case EVENT_MOVE:
                    if (touch.distance > options.holdThreshold)
                    {
                        clearTimeout(timer);
                    }
                    break;
                case EVENT_END:
                case EVENT_CANCEL:
                    clearTimeout(timer);
                    break;
            }
        }
    });
})(window);

(function()
{
    'use strict';

    var xhr;
    var Http = function() {};

    Http.prototype.getXhr = function()
    {
        return xhr;
    };

    Http.prototype.send = function(method, url, successCallback, errorCallback)
    {
        if(this.debug) console.groupCollapsed('%cHTTP ' + method + ': ' + url, 'color: blue; border-left: 10px solid blue; padding-left: 5px; font-size: 16px; font-weight: bold; background-color: lightblue;');

        xhr = window.plus ? new window.plus.net.XMLHttpRequest() : new XMLHttpRequest();
        var that = this;
        var protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;

        if(this.debug) console.log('XMLHttpRequest:', xhr);

        xhr.onreadystatechange = function()
        {
            if(that.debug) console.log('readyState:', xhr.readyState, ', status:', xhr.status);

            if (xhr.readyState === 4)
            {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:'))
                {
                    if(that.debug)
                    {
                        console.group('responseText');
                        console.log("%c" + xhr.responseText, 'color:blue; margin: 3px 0; padding:2px 5px; background: #fafafa');
                        console.groupEnd();
                        console.groupCollapsed('ResponseHeaders');
                        console.log(xhr.getAllResponseHeaders());
                        console.groupEnd();

                        console.groupEnd();
                    }

                    successCallback && successCallback(xhr.responseText, xhr);
                }
                else
                {
                    if(that.debug) console.groupEnd();
                    errorCallback && errorCallback(xhr);
                }
            }
        };

        xhr.open(method, url, true);
        xhr.send();

        return xhr;
    };

    Http.prototype.get = function(url, successCallback, errorCallback)
    {
        return this.send('GET', url, successCallback, errorCallback);
    };

    Http.prototype.post = function(url, successCallback, errorCallback)
    {
        return this.send('POST', url, successCallback, errorCallback);
    };

    window.http = new Http();
    window.http.debug = true;
}());

(function()
{
    'use strict';

    if(!window.plusReady)
    {
        window.plusReady = function(callback)
        {
            if (window.plus)
            {
                callback();
            }
            else
            {
                document.addEventListener("plusready", function()
                {
                    callback();
                }, false);
            }
            return window;
        };
    }

    if(!window.fire)
    {
        window.fire = function(webview, eventType, data)
        {
            console.groupCollapsed('%cFIRE: ' + eventType, 'color: #fff; background-color: orange;');
            console.log('webview', webview);
            console.log('data', data);
            console.groupEnd();
            
            if (webview)
            {
                webview.evalJS("window.receive&&window.receive('" + eventType + "','" + JSON.stringify(data ||
                {}) + "')");
            }
        };

        window.receive = function(eventType, data)
        {
            console.groupCollapsed('%cRECEIVE: ' + eventType, 'color: #fff; background-color: orange;');
            console.log('data', data);
            console.groupEnd();

            if (eventType)
            {
                data = JSON.parse(data);
                window.trigger(window, eventType, data);
            }
        };
    }
}());

/* ========================================================================
 * Ratchet: sliders.js v2.0.2
 * http://goratchet.com/components#sliders
 * ========================================================================
   Adapted from Brad Birdsall's swipe
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
  'use strict';

  var pageX;
  var pageY;
  var slider;
  var deltaX;
  var deltaY;
  var offsetX;
  var lastSlide;
  var startTime;
  var resistance;
  var sliderWidth;
  var slideNumber;
  var isScrolling;
  var scrollableArea;
  var startedMoving;

  var getSlider = function (target) {
    var i;
    var sliders = document.querySelectorAll('.slider > .slide-group');

    for (; target && target !== document; target = target.parentNode) {
      for (i = sliders.length; i--;) {
        if (sliders[i] === target) {
          return target;
        }
      }
    }
  };

  var getScroll = function () {
    if ('webkitTransform' in slider.style) {
      var translate3d = slider.style.webkitTransform.match(/translate3d\(([^,]*)/);
      var ret = translate3d ? translate3d[1] : 0;
      return parseInt(ret, 10);
    }
  };

  var setSlideNumber = function (offset) {
    var round = offset ? (deltaX < 0 ? 'ceil' : 'floor') : 'round';
    slideNumber = Math[round](getScroll() / (scrollableArea / slider.children.length));
    slideNumber += offset;
    slideNumber = Math.min(slideNumber, 0);
    slideNumber = Math.max(-(slider.children.length - 1), slideNumber);
  };

  var onTouchStart = function (e) {
    slider = getSlider(e.target);

    if (!slider) {
      return;
    }

    var firstItem  = slider.querySelector('.slide');

    scrollableArea = firstItem.offsetWidth * slider.children.length;
    isScrolling    = undefined;
    sliderWidth    = slider.offsetWidth;
    resistance     = 1;
    lastSlide      = -(slider.children.length - 1);
    startTime      = +new Date();
    pageX          = e.touches[0].pageX;
    pageY          = e.touches[0].pageY;
    deltaX         = 0;
    deltaY         = 0;

    setSlideNumber(0);

    slider.style['-webkit-transition-duration'] = 0;
  };

  var onTouchMove = function (e) {
    if (e.touches.length > 1 || !slider) {
      return; // Exit if a pinch || no slider
    }

    // adjust the starting position if we just started to avoid jumpage
    if (!startedMoving) {
      pageX += (e.touches[0].pageX - pageX) - 1;
    }

    deltaX = e.touches[0].pageX - pageX;
    deltaY = e.touches[0].pageY - pageY;
    pageX  = e.touches[0].pageX;
    pageY  = e.touches[0].pageY;

    if (typeof isScrolling === 'undefined' && startedMoving) {
      isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
    }

    if (isScrolling) {
      return;
    }

    offsetX = (deltaX / resistance) + getScroll();

    e.preventDefault();

    resistance = slideNumber === 0         && deltaX > 0 ? (pageX / sliderWidth) + 1.25 :
                 slideNumber === lastSlide && deltaX < 0 ? (Math.abs(pageX) / sliderWidth) + 1.25 : 1;

    slider.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';

    // started moving
    startedMoving = true;
  };

  var onTouchEnd = function (e) {
    if (!slider || isScrolling) {
      return;
    }

    // we're done moving
    startedMoving = false;

    setSlideNumber(
      (+new Date()) - startTime < 1000 && Math.abs(deltaX) > 15 ? (deltaX < 0 ? -1 : 1) : 0
    );

    offsetX = slideNumber * sliderWidth;

    slider.style['-webkit-transition-duration'] = '.2s';
    slider.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';

    e = new CustomEvent('slide', {
      detail: { slideNumber: Math.abs(slideNumber) },
      bubbles: true,
      cancelable: true
    });

    slider.parentNode.dispatchEvent(e);
  };

  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);

}());

/* ========================================================================
 * Ratchet: segmented-controllers.js v2.0.2
 * http://goratchet.com/components#segmentedControls
 * ========================================================================
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
  'use strict';

  var getTarget = function (target) {
    var i;
    var segmentedControls = document.querySelectorAll('.segmented-control .control-item');

    for (; target && target !== document; target = target.parentNode) {
      for (i = segmentedControls.length; i--;) {
        if (segmentedControls[i] === target) {
          return target;
        }
      }
    }
  };

  window.addEventListener('touchend', function (e) {
    var activeTab;
    var activeBodies;
    var targetBody;
    var targetTab     = getTarget(e.target);
    var className     = 'active';
    var classSelector = '.' + className;

    if (!targetTab) {
      return;
    }

    activeTab = targetTab.parentNode.querySelector(classSelector);

    if (activeTab) {
      activeTab.classList.remove(className);
    }

    targetTab.classList.add(className);

    if (!targetTab.hash) {
      return;
    }

    targetBody = document.querySelector(targetTab.hash);

    if (!targetBody) {
      return;
    }

    activeBodies = targetBody.parentNode.querySelectorAll(classSelector);

    for (var i = 0; i < activeBodies.length; i++) {
      activeBodies[i].classList.remove(className);
    }

    targetBody.classList.add(className);
  });

  window.addEventListener('click', function (e) { if (getTarget(e.target)) {e.preventDefault();} });
}());
