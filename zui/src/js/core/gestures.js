/**
 * mui gestures
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function(window)
{
    var EVENT_START = 'touchstart';
    var EVENT_MOVE = 'touchmove';
    var EVENT_END = 'touchend';
    var EVENT_CANCEL = 'touchcancel';
    var EVENT_CLICK = 'click';

    /**
     * Gesture config
     * @type {object}
     */
    if (!window.gestureConfig)
    {
        window.gestureConfig =
        {
            tap: true,
            doubletap: false,
            longtap: false,
            flick: true,
            swipe: true,
            drag: true
        };
    }

    /**
     * Gesture functions
     */
    var gestures = [];

    /**
     * register gesture
     * @param {type} gesture
     * @returns {gestures}
     */
    var registerGesture = function(gesture)
    {
        gesture.index = gesture.index || 1000;

        gestures.push(gesture);

        gestures.sort(function(a, b)
        {
            return a.index - b.index;
        });
        return gestures;
    };

    /**
     * distance
     * @param {type} p1
     * @param {type} p2
     * @returns {Number}
     */
    var getDistance = function(p1, p2)
    {
        var x = p2.x - p1.x;
        var y = p2.y - p1.y;
        return Math.sqrt((x * x) + (y * y));
    };

    /**
     * angle
     * @param {type} p1
     * @param {type} p2
     * @returns {Number}
     */
    var getAngle = function(p1, p2)
    {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    };

    /**
     * direction
     * @param {type} angle
     * @returns {unresolved}
     */
    var getDirectionByAngle = function(angle)
    {
        if (angle < -45 && angle > -135)
        {
            return 'up';
        }
        else if (angle >= 45 && angle < 135)
        {
            return 'down';
        }
        else if (angle >= 135 || angle <= -135)
        {
            return 'left';
        }
        else if (angle >= -45 && angle <= 45)
        {
            return 'right';
        }
        return null;
    };

    /**
     * detect gestures
     * @param {type} event
     * @param {type} touch
     * @returns {undefined}
     */
    var detect = function(event, touch)
    {
        if (gestures.stoped)
        {
            return;
        }
        gestures.forEach(function(gesture)
        {
            if (!gestures.stoped)
            {
                if (window.gestureConfig[gesture.name] !== false)
                {
                    if (gesture.hasOwnProperty('handle'))
                    {
                        gesture.handle(event, touch);
                    }
                }
            }
        });
    };

    var touch = {};
    var detectTouchStart = function(event)
    {
        gestures.stoped = false;
        var now = Date.now();
        var point = event.touches ? event.touches[0] : event;
        touch = {
            target: event.target,
            lastTarget: (touch.lastTarget ? touch.lastTarget : null),
            startTime: now,
            touchTime: 0,
            flickStartTime: now,
            lastTapTime: (touch.lastTapTime ? touch.lastTapTime : 0),
            start:
            {
                x: point.pageX,
                y: point.pageY
            },
            flickStart:
            {
                x: point.pageX,
                y: point.pageY
            },
            flickDistanceX: 0,
            flickDistanceY: 0,
            move:
            {
                x: 0,
                y: 0
            },
            deltaX: 0,
            deltaY: 0,
            lastDeltaX: 0,
            lastDeltaY: 0,
            angle: '',
            direction: '',
            distance: 0,
            drag: false,
            swipe: false,
            gesture: event
        };

        detect(event, touch);
    };

    var detectTouchMove = function(event)
    {
        if (gestures.stoped)
        {
            return;
        }
        var now = Date.now();
        var point = event.touches ? event.touches[0] : event;
        touch.touchTime = now - touch.startTime;
        touch.move = {
            x: point.pageX,
            y: point.pageY
        };
        if (now - touch.flickStartTime > 300)
        {
            touch.flickStartTime = now;
            touch.flickStart = touch.move;
        }
        touch.distance = getDistance(touch.start, touch.move);
        touch.angle = getAngle(touch.start, touch.move);
        touch.direction = getDirectionByAngle(touch.angle);
        touch.lastDeltaX = touch.deltaX;
        touch.lastDeltaY = touch.deltaY;
        touch.deltaX = touch.move.x - touch.start.x;
        touch.deltaY = touch.move.y - touch.start.y;
        touch.gesture = event;

        detect(event, touch);
    };

    var detectTouchEnd = function(event)
    {
        if (gestures.stoped)
        {
            return;
        }
        var now = Date.now();
        touch.touchTime = now - touch.startTime;
        touch.flickTime = now - touch.flickStartTime;
        touch.flickDistanceX = touch.move.x - touch.flickStart.x;
        touch.flickDistanceY = touch.move.y - touch.flickStart.y;
        touch.gesture = event;

        detect(event, touch);
    };

    window.addEventListener(EVENT_START, detectTouchStart);
    window.addEventListener(EVENT_MOVE, detectTouchMove);
    window.addEventListener(EVENT_END, detectTouchEnd);
    window.addEventListener(EVENT_CANCEL, detectTouchEnd);

    //fixed hashchange(android)
    window.addEventListener(EVENT_CLICK, window.preventDefault);

    /**
     * mui gesture flick[left|right|up|down]
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'flick',
        index: 5,
        options:
        {
            flickMaxTime: 300,
            flickMinDistince: 10
        },
        handle: function(event, touch)
        {
            if (event.type === EVENT_END || event.type === EVENT_CANCEL)
            {
                var options = this.options;
                if (touch.direction && options.flickMaxTime > touch.flickTime && touch.distance > options.flickMinDistince)
                {
                    touch.flick = true;
                    window.trigger(event.target, 'flick', touch);
                    window.trigger(event.target, 'flick' + touch.direction, touch);
                }
            }
        }
    });

    /**
     * mui gesture swipe[left|right|up|down]
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'swipe',
        index: 10,
        options:
        {
            swipeMaxTime: 300,
            swipeMinDistince: 18
        },
        handle: function(event, touch)
        {
            if (event.type === EVENT_END || event.type === EVENT_CANCEL)
            {
                var options = this.options;
                if (touch.direction && options.swipeMaxTime > touch.touchTime && touch.distance > options.swipeMinDistince)
                {
                    touch.swipe = true;
                    window.trigger(event.target, 'swipe' + touch.direction, touch);
                }
            }
        }
    });

    /**
     * mui gesture drag[start|left|right|up|down|end]
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'drag',
        index: 20,
        options:
        {},
        handle: function(event, touch)
        {
            switch (event.type)
            {
                case EVENT_MOVE:
                    if (touch.direction)
                    { //drag
                        if (!touch.drag)
                        {
                            touch.drag = true;
                            window.trigger(event.target, 'dragstart', touch);
                        }
                        window.trigger(event.target, 'drag', touch);
                        window.trigger(event.target, 'drag' + touch.direction, touch);
                    }
                    break;
                case EVENT_END:
                case EVENT_CANCEL:
                    if (touch.drag)
                    {
                        window.trigger(event.target, 'dragend', touch);
                    }
                    break;
            }
        }
    });

    /**
     * mui gesture tap and doubleTap
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'tap',
        index: 30,
        options:
        {
            tapMaxInterval: 300,
            tapMaxDistance: 5,
            tapMaxTime: 250
        },
        handle: function(event, touch)
        {
            //if (event.type === EVENT_END || event.type === EVENT_CANCEL) {
            if (event.type === EVENT_END)
            { //ignore touchcancel
                var options = this.options;
                if (touch.distance < options.tapMaxDistance && touch.touchTime < options.tapMaxTime)
                {
                    if (window.gestureConfig.doubletap && touch.lastTarget && (touch.lastTarget === event.target))
                    { //same target
                        if (touch.lastTapTime && (touch.startTime - touch.lastTapTime) < options.tapMaxInterval)
                        {
                            window.trigger(event.target, 'doubletap', touch);
                            touch.lastTapTime = Date.now();
                            touch.lastTarget = event.target;
                            return;
                        }
                    }
                    window.trigger(event.target, 'tap', touch);
                    touch.lastTapTime = Date.now();
                    touch.lastTarget = event.target;
                }
            }
        }
    });

    /**
     * mui gesture longtap
     * @param {type} $
     * @param {type} name
     * @returns {undefined}
     */
    registerGesture(
    {
        name: 'longtap',
        index: 10,
        options:
        {
            holdTimeout: 500,
            holdThreshold: 2
        },
        handle: function(event, touch)
        {
            var options = this.options;
            switch (event.type)
            {
                case EVENT_START:
                    clearTimeout(timer);
                    timer = setTimeout(function()
                    {
                        if (!touch.drag)
                        {
                            window.trigger(event.target, 'longtap', touch);
                        }
                    }, options.holdTimeout);
                    break;
                case EVENT_MOVE:
                    if (touch.distance > options.holdThreshold)
                    {
                        clearTimeout(timer);
                    }
                    break;
                case EVENT_END:
                case EVENT_CANCEL:
                    clearTimeout(timer);
                    break;
            }
        }
    });
})(window);
