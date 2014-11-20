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
                    document.body.classList[that.options.wait ? 'add' : 'remove']('waiting');
                    that.render(that.options.data);
                }
            }).on('overwait', function()
            {
                document.body.classList.remove('waiting');
            });

            document.body.classList[that.options.wait ? 'add' : 'remove']('waiting');
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
        console.log('render', this, obj);
        var doms, val, fmt, dft, dType, valType, imgSrc, options = this.options;
        var handleElement = function(el)
        {
            dType = el.getAttribute('data-type');

            if(dType === 'date')
            {
                valType = typeof(val);
                if(valType === 'string') val = new Date(Date.parse(val));
                else if(valType === 'number') val = new Date(val);
            }

            fmt = el.getAttribute('data-format');

            if(fmt && val)
            {
                console.log('format', val, fmt, val.format(fmt));
                val = val.format(fmt);
            }
            else if(!val)
            {
                val = dft || '';
            }

            el.innerHTML = val;

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
