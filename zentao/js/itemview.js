(function()
{
    var ItemView = function(settings, render)
    {
        this.renderMore = render;

        var that = this;
        window.plusReady(function()
        {
            currentView = window.currentWebview;
            options = currentView.options;

            that.render(options.data);
        });
    };

    ItemView.prototype.render = function(obj)
    {
        var doms, val, fmt, dft, dVal;
        var handleElement = function(el)
        {
            fmt = el.getAttribute('data-format');
            dft = el.getAttribute('data-default');
            dVal = dft && (!val) ? dft : val;
            el.innerHTML = dVal && fmt ? dVal.format(fmt) : dVal;
        };
        for(var name in obj)
        {
            doms = document.$class("obj-" + name),
            val = obj[name];

            doms.forEach(handleElement);
        }

        document.$class('dialog-header')[0].classList.add('pri-' + obj.pri);
        document.$id("objID").classList.add('pri-' + obj.pri);
        var $status = document.$id('objStatus');
        $status.innerHTML = obj.statusName;
        $status.classList.add('badge-' + obj.statusColor);

        if(typeof this.renderMore === 'function')
        {
            this.renderMore(obj);
        }
    };

    window.ItemView = ItemView;
}());
