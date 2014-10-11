(function()
{
    'use strict';

    var forEach = Array.prototype.forEach;

    /**
     * forEach for NodeList
     * @type {[type]}
     */
    NodeList.prototype.forEach = forEach;

    /**
     * Bind event on node or the window object
     * @param  {string}   event
     * @param  {Function} fn
     * @return {Node}     or window
     */
    window.on = Node.prototype.on = function(event, fn)
    {
        this.addEventListener(event, fn, false);
        return this;
    };

    /**
     * Bind event on all node in NodeList or the window object
     * @param  {string}   event
     * @param  {Function} fn
     * @return {NodeList}
     */
    NodeList.prototype.on = function(event, fn)
    {
        forEach.call(this, function(el)
        {
            el.on(event, fn);
        });
        return this;
    };

    /**
     * Custom event object
     * @type {object}
     */
    if (typeof window.CustomEvent === 'undefined')
    {
        var CustomEvent = function(event, params)
        {
            params = params ||
            {
                bubbles: false,
                cancelable: false,
                detail: undefined
            };
            var evt = document.createEvent('Events');
            var bubbles = true;
            if (params)
            {
                for (var name in params)
                {
                    (name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
                }
            }
            evt.initEvent(event, bubbles, true);
            return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    /**
     * Trigger event on element
     * @param  {object} element
     * @param  {string} eventType
     * @param  {object} eventData
     * @return {void}
     */
    window.trigger = function(element, eventType, eventData)
    {
        element.dispatchEvent(new CustomEvent(eventType,
        {
            data: eventData,
            bubbles: true,
            cancelable: true
        }));
    };

    /**
     * Trigger event, data optional
     * @param  {string}  type
     * @param  {anytype} data optional
     * @return {node}    or window
     */
    Node.prototype.trigger = function(type, data)
    {
        window.trigger(this, type, data);
    };

    /**
     * Trigger event on all node in NodeList
     * @param  {string}   type
     * @return {NodeList}
     */
    NodeList.prototype.trigger = function(event)
    {
        forEach.call(this, function(el)
        {
            el.trigger(event);
        });
        return this;
    };

    var div = document.createElement("div"),
    prefix = ["moz", "webkit", "ms", "o"].filter(function(prefix)
    {
        return prefix + "MatchesSelector" in div;
    })[0] + "MatchesSelector";

    /**
     * Bind event on Element object, delegate optional
     * @param {string}   type
     * @param {string}   or {function}   selector or function
     * @param {Function} fn  optional
     */
    document.on = 
    Element.prototype.on = 
    Element.prototype.addDelegateListener = function(type, selector, fn)
    {
        if(typeof selector === 'function')
        {
            this.addEventListener(type, selector, false);
        }
        else if(typeof fn === 'function')
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
        }
        return this;
    };

    /**
     * Get view port of document
     * @return {object}
     */
    window.getViewport = function()
    {
        if (document.compatMode == "BackCompat")
        {　　　　　　
            return {　　　　　　　　
                width  : document.body.clientWidth,
                height : document.body.clientHeight　　　　　　
            };
        }
        else
        {　　　　　　
            return {　　　　　　　　
                width  : document.documentElement.clientWidth,
                height : document.documentElement.clientHeight　　　　　　
            };　　　　
        }　　
    };

    /**
     * Get scroll left offset
     * @return {number}
     */
    window.getScrollLeft = function()
    {
        return (document.compatMode == "BackCompat") ?
            document.body.scrollLeft : 
            document.documentElement.scrollLeft;
    };

    /**
     * Get scroll top offset
     * @return {number}
     */
    window.getScrollTop = function()
    {
        return (document.compatMode == "BackCompat") ?
            document.body.scrollTop : 
            document.documentElement.scrollTop;
    };

    /**
     * Get scroll offset
     * @return {object}
     */
    window.getScrollPosition = function()
    {
        return (document.compatMode == "BackCompat") ?
            {x: document.body.scrollLeft, y: document.body.scrollTop} : 
            {x: document.documentElement.scrollLeft, y: document.documentElement.scrollTop};
    };

    /**
     * Scroll to top position smoothly.
     * @param  {number}   scrollTop
     * @param  {number}   duration
     * @param  {Function} callback
     * @return {void}        
     */
    window.scrollToSmooth = function(scrollTop, duration, callback)
    {
        duration = duration || 1000;
        var scroll = function(duration)
        {
            if (duration <= 0)
            {
                callback && callback();
                return;
            }
            var distaince = scrollTop - window.scrollY;
            setTimeout(function()
            {
                window.scrollTo(0, window.scrollY + distaince / duration * 10);
                scroll(duration - 10);
            }, 16.7);
        };
        scroll(duration);
    }

    /**
     * Get left offset from page
     * @return {number}
     */
    Element.prototype.getPageLeft = function()
    {
        var actualLeft = this.offsetLeft;　　　　
        var current = this.offsetParent;　　　　
        while (current !== null)
        {　　　　　　
            actualLeft += current.offsetLeft;　　　　　　
            current = current.offsetParent;　　　　
        }　　　　
        return actualLeft;
    };

    /**
     * Get top offset from page
     * @return {number}
     */
    Element.prototype.getPageTop = function()
    {
        var actualTop = this.offsetTop;　　　　
        var current = this.offsetParent;　　　　
        while (current !== null)
        {　　　　　　
            actualTop += current.offsetTop;　　　　　　
            current = current.offsetParent;　　　　
        }　　　　
        return actualTop;　　
    };

    /**
     * Get page offset
     * @return {object}
     */
    Element.prototype.getPageOffset = function()
    {
        var offset = {top: this.offsetTop, left: this.offsetLeft};　　　　
        var current = this.offsetParent;　　　　
        while (current !== null)
        {　　　　　　
            offset.top += current.offsetTop;　　　　　　
            offset.left += current.offsetLeft;　　　　　　
            current = current.offsetParent;　　　　
        }　　　　
        return offset;　　
    };

    /**
     * Get left offset from view area
     * @return {number}
     */
    Element.prototype.getViewLeft = function()
    {　　　　
        return this.getPageLeft() - window.getScrollLeft();　　
    };

    /**
     * Get top offset from view area
     * @return {number}
     */
    Element.prototype.getViewTop = function()
    {　　　　
        return this.getPageTop() - window.getScrollTop();　　
    };

    /**
     * Get offset from view area
     * @return {number}
     */
    Element.prototype.getViewOffset = function()
    {　　　　
        var offset = this.getPageOffset();
        offset.top  -= window.getScrollTop();
        offset.left -= window.getScrollLeft();
        return offset;
    };

    /**
     * Get styles of the element
     * @param  {string} property
     * @return {string}
     */
    Element.prototype.getStyles = function(property)
    {
        var styles = this.ownerDocument.defaultView.getComputedStyle(this, null);
        if (property)
        {
            return styles.getPropertyValue(property) || styles[property];
        }
        return styles;
    };

    /**
     * Put callback to document ready
     * @param {Function} callback
     */
    var readyRE = /complete|loaded|interactive/;
    document.ready = function(callback)
    {
        if (readyRE.test(document.readyState))
        {
            callback();
        }
        else
        {
            document.addEventListener('DOMContentLoaded', function()
            {
                callback();
            }, false);
        }
    }
}());
