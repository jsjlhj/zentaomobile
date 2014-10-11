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
    EventDrawer.prototype.getEventName = function(et)
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
        var name   = this.getEventName(e);
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
        var name   = this.getEventName(e);
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
        var name = this.getEventName(e);
        if(!this.eventDrawer[name])
        {
            this.eventDrawer[name] = [];
        }
        this.eventDrawer[name].push({name: e, fn: fn});
        return this;
    };
}());
