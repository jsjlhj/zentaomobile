/*globals Node:true, NodeList:true*/
$ = (function(document, window, $) {
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

var div = document.createElement("div"),
    prefix = ["moz", "webkit", "ms", "o"].filter(function(prefix)
    {
        return prefix + "MatchesSelector" in div;
    })[0] + "MatchesSelector";

Element.prototype.addDelegateListener = function(type, selector, fn)
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
};

function getViewport()
{　　　　
    if (document.compatMode == "BackCompat")
    {　　　　　　
        return {　　　　　　　　
            width: document.body.clientWidth,
            　　　　　　　　height: document.body.clientHeight　　　　　　
        }　　　　
    }
    else
    {　　　　　　
        return {　　　　　　　　
            width: document.documentElement.clientWidth,
            　　　　　　　　height: document.documentElement.clientHeight　　　　　　
        }　　　　
    }　　
}

/* http://www.ruanyifeng.com/blog/2009/09/find_element_s_position_using_javascript.html */
function getElementLeft(element)
{　　　　
    var actualLeft = element.offsetLeft;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualLeft += current.offsetLeft;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    return actualLeft;　　
}　　

function getElementTop(element)
{　　　　
    var actualTop = element.offsetTop;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualTop += current.offsetTop;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    return actualTop;　　
}

function getElementViewLeft(element)
{　　　　
    var actualLeft = element.offsetLeft;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualLeft += current.offsetLeft;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    if (document.compatMode == "BackCompat")
    {　　　　　　
        var elementScrollLeft = document.body.scrollLeft;　　　　
    }
    else
    {　　　　　　
        var elementScrollLeft = document.documentElement.scrollLeft;　　　　
    }　　　　
    return actualLeft - elementScrollLeft;　　
}　　

function getElementViewTop(element)
{　　　　
    var actualTop = element.offsetTop;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null)
    {　　　　　　
        actualTop += current.offsetTop;　　　　　　
        current = current.offsetParent;　　　　
    }　　　　
    if (document.compatMode == "BackCompat")
    {　　　　　　
        var elementScrollTop = document.body.scrollTop;　　　　
    }
    else
    {　　　　　　
        var elementScrollTop = document.documentElement.scrollTop;　　　　
    }　　　　
    return actualTop - elementScrollTop;　　
}

function isPlainObject(obj)
{
    Object.getPrototypeOf || (Object.getPrototypeOf = function(obj)
    {
        return obj.__proto__ || obj.prototype || (obj.constructor && obj.constructor.prototype) || Object.prototype;
    });
    return obj != null && typeof(obj) == "object" && Object.getPrototypeOf(obj) == Object.prototype;
}

function versionToNumber(ver)
{
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
}
