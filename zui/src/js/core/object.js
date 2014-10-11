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
