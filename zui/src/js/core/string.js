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
