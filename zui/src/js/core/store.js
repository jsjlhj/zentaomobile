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
            if (reset !== undefined) {
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
        var createDateParser = function (chainFilter) {
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
        };

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
        this.enable = (lsName in window) && window[lsName] && window[lsName].setItem;
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
            if (!this.slience) throw new Error('Your browser not support localStorage or enable status been set true.');
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
        val = (defaultValue !== undefined && (typeof val === 'undefined' || val === null || val === undefined)) ? defaultValue : val;
        console.groupCollapsed('%cSTORE GET: ' + key, 'color: purple; border-left: 10px solid orange; padding-left: 5px;font-size: 14px; font-weight: bold;');
        console.log('val', val);
        console.groupEnd();
        return val;
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

    /**
     * No conflict and get origin object named 'store'
     * @return {object}
     */
    window.store.noConflict = function() {
        window.store = old;
        return window.store;
    };
}());
