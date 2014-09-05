/* Store */
+function()
{
    "use strict";

    var lsName = 'localStorage';
    var storage = window[lsName],
        old = window['store'];

    /* The Store object */
    var Store = function()
    {
        this.slience = true;
        this.enable = (lsName in window) && window[lsName] && window[lsName]['setItem'];
        this.storage = storage;
        this.withPlus = false;
    };

    Store.prototype.setPlusStorage = function(plus)
    {
        if(plus && plus.storage &&  plus.storage.getLength)
        {
            this.enable = true;
            storage = plus.storage;
            this.storage = storage;
            this.withPlus = true;
        }
    };

    /* Check enable status */
    Store.prototype.check = function()
    {
        if(!this.enable)
        {
            if(!this.slience) throw new Error('Browser not support localStorage or enable status been set true.');
        }
        return this.enable;
    };

    /* Get length */
    Store.prototype.length = function()
    {
        if(this.check())
        {
            return this.withPlus ? storage.getLength() : storage.length;
        }
        return 0;
    };

    /* Remove item with browser localstorage native method */
    Store.prototype.removeItem = function(key)
    {
        storage.removeItem(key);
    };

    /* Remove item with browser localstorage native method, same as removeItem */
    Store.prototype.remove = function(key)
    {
        this.removeItem(key);
    };

    /* Get item value with browser localstorage native method, and without deserialize */
    Store.prototype.getItem = function(key)
    {
        return storage.getItem(key);
    };

    /* Get item value and deserialize it, if value is null and defaultValue been given then return defaultValue */
    Store.prototype.get = function(key, defaultValue)
    {
        var val = this.deserialize(this.getItem(key));
        return (defaultValue !== undefined && (val === null || val === undefined)) ? defaultValue : val;
    };

    /* Get item key by index and deserialize it */
    Store.prototype.key = function(index)
    {
        return storage.key(key);
    };

    /* Set item value with browser localstorage native method, and without serialize filter */
    Store.prototype.setItem = function(key, val)
    {
        storage.setItem(key, val);
    };

    /* Set item value, serialize it if the given value is not an string */
    Store.prototype.set = function(key, val)
    {
        if(val === undefined) return this.remove(key);
        this.setItem(key, this.serialize(val));
        console.log('> STORE SET: ' + key + '=' + this.serialize(val));

        console.groupCollapsed('%cSTORE SET: ' + key + '=' + this.serialize(val), 'color: purple; border-left: 10px solid orange; padding-left: 5px;font-size: 14px; font-weight: bold;');
        console.log(val);
        console.groupEnd();
    };

    /* Clear all items with browser localstorage native method */
    Store.prototype.clear = function()
    {
        storage.clear();
    };

    /* Iterate all items with callback */
    Store.prototype.forEach = function(callback)
    {
        for(var i = 0; i < storage.length; i++)
        {
            var key = storage.key(i);
            callback(key, store.get(key));
        }
    };

    /* Get all items and set value in an object. */
    Store.prototype.getAll = function(callback)
    {
        var all = {};
        this.forEach(function(key, val)
        {
            all[key] = val;
        });

        return all;
    };

    /* Serialize value with JSON.stringify */
    Store.prototype.serialize = function(value)
    {
        if(typeof value === 'string') return value;
        return JSON.stringify(value);
    };

    /* Deserialize value, with JSON.parse if the given value is not a string */
    Store.prototype.deserialize = function(value)
    {
        if(typeof value !== 'string') return undefined;
        try
        {
            return JSON.parse(value);
        }
        catch(e)
        {
            return value || undefined;
        }
    };

    var store = new Store();

    window.store = store;

    window.store.noConflict = function()
    {
        window.store = old;
        return store;
    }
}();
