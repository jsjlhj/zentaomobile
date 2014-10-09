(function() {
    'use strict';

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

    /*globals Node:true, NodeList:true*/
    window.$ = (function(document, window, $) {
        var node = Node.prototype,
            nodeList = NodeList.prototype,
            forEach = 'forEach',
            trigger = 'trigger',
            each = [][forEach],
            dummy = document.createElement('i');

        nodeList[forEach] = each;

        window.on = node.on = function(event, fn) {
            this.addEventListener(event, fn, false);
            return this;
        };

        nodeList.on = function(event, fn) {
            each.call(this, function(el) {
                el.on(event, fn);
            });
            return this;
        };

        window[trigger] = node[trigger] = function(type, data) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent(type, true, true);
            event.data = data || {};
            event.eventName = type;
            event.target = this;
            this.dispatchEvent(event);
            return this;
        };

        nodeList[trigger] = function(event) {
            each.call(this, function(el) {
                el[trigger](event);
            });
            return this;
        };

        $ = function(s) {
            var r = document.querySelectorAll(s || '☺'),
                length = r.length;
            return length == 1 ? r[0] : !length ? nodeList : r;
        };

        $.on = node.on.bind(dummy);
        $[trigger] = node[trigger].bind(dummy);

        return $;
    })(document, this);
}());
