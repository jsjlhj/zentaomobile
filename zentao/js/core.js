if (typeof Array.isArray === 'undefined')
{
    Array.isArray = function(obj)
    {
        return Object.toString.call(obj) === '[object Array]';
    }
};

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

Date.ONEDAY_TICKS = 24 * 3600 * 1000;
Date.WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

Date.prototype.getDayName = function(weekdayNames)
{
    weekdayNames = weekdayNames || Date.WEEKDAY_NAMES;
    return weekdayNames[this.getDay()];
};

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

Date.prototype.addMilliseconds = function(value)
{
    this.setTime(this.getTime() + value);
    return this;
};

Date.prototype.addDays = function(days)
{
    this.addMilliseconds(days * Date.ONEDAY_TICKS);
    return this;
};

Date.prototype.clone = function()
{
    var date = new Date();
    date.setTime(this.getTime());
    return date;
};

Date.isLeapYear = function(year)
{
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function(year, month)
{
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function()
{
    var y = this.getFullYear();
    return (((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0));
};

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

Date.prototype.clearTime = function()
{
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};

Date.prototype.getDaysInMonth = function()
{
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function(value)
{
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

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

Date.prototype.isSameDay = function(date)
{
    return date.toDateString() === this.toDateString();
};

Date.prototype.isSameWeek = function(date)
{
    var weekStart = this.getLastWeekday();
    var weekEnd = weekStart.clone().addDays(7);
    return date >= weekStart && date < weekEnd;
};

Date.prototype.isSameYear = function(date)
{
    return this.getFullYear() === date.getFullYear();
};

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
 * @access public
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

String.prototype.startWith = function(str)
{
    return this.indexOf(str) === 0;
};

String.prototype.upperCaseFirstLetter = function(str)
{
    if(this.length > 1) return this.substring(0,1).toUpperCase()+ this.substring(1);
    else return this.toUpperCase();
};


var div = document.createElement("div"),
    prefix = ["moz", "webkit", "ms", "o"].filter(function(prefix)
    {
        return prefix + "MatchesSelector" in div;
    })[0] + "MatchesSelector";

Element.prototype.addDelegateListener = function(type, selector, fn)
{
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
};

function getViewport()
{　　　　
    if (document.compatMode == "BackCompat")
    {　　　　　　
        return {　　　　　　　　
            width: document.body.clientWidth,
            　　　　　　　　height: document.body.clientHeight　　　　　　
        }　　　　
    }
    else
    {　　　　　　
        return {　　　　　　　　
            width: document.documentElement.clientWidth,
            　　　　　　　　height: document.documentElement.clientHeight　　　　　　
        }　　　　
    }　　
}

/* http://www.ruanyifeng.com/blog/2009/09/find_element_s_position_using_javascript.html */
function getElementLeft(element)
{　　　　
    var actualLeft = element.offsetLeft;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualLeft += current.offsetLeft;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    return actualLeft;　　
}　　

function getElementTop(element)
{　　　　
    var actualTop = element.offsetTop;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualTop += current.offsetTop;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    return actualTop;　　
}

function getElementViewLeft(element)
{　　　　
    var actualLeft = element.offsetLeft;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualLeft += current.offsetLeft;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    if (document.compatMode == "BackCompat")
    {　　　　　　
        var elementScrollLeft = document.body.scrollLeft;　　　　
    }
    else
    {　　　　　　
        var elementScrollLeft = document.documentElement.scrollLeft;　　　　
    }　　　　
    return actualLeft - elementScrollLeft;　　
}　　

function getElementViewTop(element)
{　　　　
    var actualTop = element.offsetTop;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualTop += current.offsetTop;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    if (document.compatMode == "BackCompat")
    {　　　　　　
        var elementScrollTop = document.body.scrollTop;　　　　
    }
    else
    {　　　　　　
        var elementScrollTop = document.documentElement.scrollTop;　　　　
    }　　　　
    return actualTop - elementScrollTop;　　
}

function isPlainObject(obj)
{
    Object.getPrototypeOf || (Object.getPrototypeOf = function(obj)
    {
        return obj.__proto__ || obj.prototype || (obj.constructor && obj.constructor.prototype) || Object.prototype;
    });
    return obj != null && typeof(obj) == "object" && Object.getPrototypeOf(obj) == Object.prototype;
}
