(function()
{
    var ItemView = function(settings, render)
    {
        this.renderMore = render;

        var that = this;
        window.plusReady(function()
        {
            that.currentView = window.currentWebview;
            that.options = that.currentView.options;
            window.on('refresh', function(e)
            {
                var options = e.detail;
                if(options.type === that.options.type)
                {
                    Object.extend(that.options, options);
                    that.render(that.options.data);
                }
            });

            that.render(that.options.data);

            document.$id('dialog').on('tap', '.content-padded a', function()
            {
                var href = this.getAttribute('href');
                if(!href.startWith('http://') && !href.startWith('https://'))
                {
                    if(!that.options.url.endWith('/')) href = '/' + href;
                    href = that.options.url + href;
                }
                plus.runtime.openURL(href, function()
                {
                    alert('无法调用内置浏览器打开。');
                });
            });
        });
    };

    ItemView.prototype.render = function(obj)
    {
        // console.log('render', this, obj);
        var doms, val, fmt, dft, dVal, dType, imgSrc, options = this.options;
        var handleElement = function(el)
        {
            fmt = el.getAttribute('data-format');
            dft = el.getAttribute('data-default');
            dVal = dft && (!val) ? dft : val;
            el.innerHTML = dVal && fmt ? dVal.format(fmt) : dVal;

            dType = el.getAttribute('data-type');
            if(dType === 'html')
            {
                document.$tag('img', el).forEach(function($img)
                {
                    imgSrc = $img.getAttribute('src');
                    if(imgSrc.startWith('data/upload/'))
                    {
                        if(!options.url.endWith('/')) imgSrc = '/' + imgSrc;
                        $img.setAttribute('src', options.url + imgSrc);
                    }
                });
            }
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
