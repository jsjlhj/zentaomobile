+function()
{
    /**
     * Get prototype of a object
     * @param  {object} obj
     * @return {object}
     */
    Object.getPrototypeOf || (Object.getPrototypeOf = function(obj)
    {
        return obj.__proto__ || obj.prototype || (obj.constructor && obj.constructor.prototype) || Object.prototype;
    });

    /**
     * Judge an object is a plain object
     * @param  {object}  obj
     * @return {Boolean}
     */
    Object.isPlainObject || (Object.isPlainObject = function(obj)
    {
        return obj != null && typeof(obj) == "object" && Object.getPrototypeOf(obj) == Object.prototype;
    });
}
