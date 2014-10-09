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
