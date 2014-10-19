/* ========================================================================
 * Ratchet: sliders.js v2.0.2
 * http://goratchet.com/components#sliders
 * ========================================================================
   Adapted from Brad Birdsall's swipe
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

(function(){
    'use strict';

    var pageX,
        pageY,
        slider,
        slideGroup,
        segmentedControl,
        controlItem,
        deltaX,
        deltaY,
        offsetX,
        lastSlide,
        startTime,
        resistance,
        sliderWidth,
        slideNumber,
        isScrolling,
        scrollableArea,
        startedMoving,
        documentSlider = null;

    var getSlider = function(target)
    {
        if (documentSlider === null)
        {
            var docAttr = document.body.getAttribute('data-slider');
            documentSlider = docAttr ? document.querySelector(docAttr) : false;
        }

        if (documentSlider) return documentSlider;

        var i;
        var sliders = document.getElementsByClassName('slider');

        for (; target && target !== document; target = target.parentNode)
        {
            for (i = sliders.length; i--;)
            {
                if (sliders[i] === target)
                {
                    return target;
                }
            }
        }
    };

    var getControlItem = function(target, segmentedControl)
    {
        if(!segmentedControl) return null;
        var items = segmentedControl.querySelectorAll('.control-item'), i;

        for (; target && target !== document; target = target.parentNode)
        {
            for (i = items.length; i--;)
            {
                if (items[i] === target)
                {

                    return target;
                }
            }
        }
    };

    var getScroll = function()
    {
        if ('webkitTransform' in slideGroup.style)
        {
            var translate3d = slideGroup.style.webkitTransform.match(/translate3d\(([^,]*)/);
            var ret = translate3d ? translate3d[1] : 0;
            return parseInt(ret, 10);
        }
    };

    var setSlideNumber = function(offset)
    {
        var round = offset ? (deltaX < 0 ? 'ceil' : 'floor') : 'round';
        slideNumber = Math[round](getScroll() / (scrollableArea / slideGroup.children.length));
        slideNumber += offset;
        slideNumber = Math.min(slideNumber, 0);
        slideNumber = Math.max(-(slideGroup.children.length - 1), slideNumber);
    };

    var onTouchStart = function(e)
    {

        slider = getSlider(e.target);
        if (!slider)
        {
            return;
        }

        slideGroup = slider.querySelector('.slide-group');
        segmentedControl = slider.querySelector('.segmented-control');
        controlItem = getControlItem(e.target, segmentedControl);

        var firstItem = slideGroup.querySelector('.slide');

        scrollableArea = firstItem.offsetWidth * slideGroup.children.length;
        isScrolling = undefined;
        sliderWidth = slideGroup.offsetWidth;
        resistance = 1;
        lastSlide = -(slideGroup.children.length - 1);
        startTime = +new Date();
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
        deltaX = 0;
        deltaY = 0;

        setSlideNumber(0);

        slideGroup.style['-webkit-transition-duration'] = 0;
    };

    var onTouchMove = function(e)
    {
        if (controlItem || e.touches.length > 1 || !slider)
        {
            return; // Exit if a pinch || no slider
        }

        // adjust the starting position if we just started to avoid jumpage
        if (!startedMoving)
        {
            pageX += (e.touches[0].pageX - pageX) - 1;
        }

        deltaX = e.touches[0].pageX - pageX;
        deltaY = e.touches[0].pageY - pageY;
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;

        if (typeof isScrolling === 'undefined' && startedMoving)
        {
            isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
        }

        if (isScrolling)
        {
            return;
        }

        offsetX = (deltaX / resistance) + getScroll();

        e.preventDefault();

        resistance = slideNumber === 0 && deltaX > 0 ? (pageX / sliderWidth) + 1.25 :
            slideNumber === lastSlide && deltaX < 0 ? (Math.abs(pageX) / sliderWidth) + 1.25 : 1;

        slideGroup.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';

        // started moving
        startedMoving = true;
    };

    var onTouchEnd = function(e)
    {
        if (!slider || isScrolling)
        {
            return;
        }

        // we're done moving
        startedMoving = false;

        if(controlItem)
        {
            var controlItemName = controlItem.getAttribute('href').substr(1),
                len = slideGroup.children.length;
            slideNumber = 0;
            for (var k =  len - 1; k >= 0; k--)
            {
                if(slideGroup.children[k].getAttribute('id') === controlItemName)
                {
                    slideNumber = 0 - k;
                    break;
                }
            }
        }
        else
        {
            setSlideNumber(
                (+new Date()) - startTime < 1000 && Math.abs(deltaX) > 15 ? (deltaX < 0 ? -1 : 1) : 0
            );
        }
        offsetX = slideNumber * sliderWidth;

        slideGroup.style['-webkit-transition-duration'] = '.2s';
        slideGroup.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';

        e = new CustomEvent('slide',
        {
            detail:
            {
                slideNumber: Math.abs(slideNumber)
            },
            bubbles: true,
            cancelable: true
        });

        slideGroup.parentNode.dispatchEvent(e);

        // set active class to controller
        if (segmentedControl)
        {
            var activeControlContent = slideGroup.querySelector('.control-content.active');
            if (activeControlContent)
            {
                activeControlContent.classList.remove('active');
            }
            var slide = slideGroup.children[0 - slideNumber];
            slide.classList.add('active');

            var activeControlItem = segmentedControl.querySelector('.control-item.active');
            if (activeControlItem)
            {
                activeControlItem.classList.remove('active');
            }

            var slideId = '#' + slide.getAttribute('id'),
                sgLen = segmentedControl.children.length,
                sgItem;
            for (var i = sgLen - 1; i >= 0; i--)
            {
                sgItem = segmentedControl.children[i];
                if (sgItem.getAttribute('href') === slideId)
                {
                    sgItem.classList.add('active');
                }
            }
        }
    };

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

}());
