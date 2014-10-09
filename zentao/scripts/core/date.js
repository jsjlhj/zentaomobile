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
