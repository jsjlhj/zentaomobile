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
 * Convert first letter of the string to upper case
 * 
 * @return {string}
 */
String.prototype.upperCaseFirstLetter = function()
{
    if (this.length > 1) return this.substring(0, 1).toUpperCase() + this.substring(1);
    else return this.toUpperCase();
};
