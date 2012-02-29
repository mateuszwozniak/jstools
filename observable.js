(function (global) {

    function Observable() {}

    Observable.prototype = {
        constructor: Observable,

        /**
         * Add events which this instance can fire and handle
         * @param {String} event
         * Event names (multiple events can be passed separated by coma).
         */
        addEvents: function (event) {
            var e = Array.prototype.slice.call(arguments);
            if (!this.observers) {
                this.observers = {};
            }
            for (var i = e.length; --i >= 0;) {
                if (typeof this.observers[e[i]] === 'undefined') {
                    this.observers[e[i]] = [];
                }
            }
        },

        /**
         * Fire event with passed arguments 
         * @param {String} event
         * Event name.
         * @param {Mixed...} args
         * Arguments to pass to event hanlders (multiple arguments can be passed
         * separated by coma).
         * @return {Boolean}
         * False if any handler returned false, true otherwise.
         */
        fire: function (event, args) {
            args    = Array.prototype.slice.call(arguments, 1);
            var result  = true;
            var observers;

            if (this.hasObservers(event) && !this.isMuted(event)) {
                observers = this.observers[event];
                result = this.fireEventOnObservers(event, observers, args);
            }

            return result;
        },
        
        /**
         * Check if there are any observers for passed event
         * @param {String} event
         * Event name.
         * @return {Boolean}
         */
        hasObservers: function (event) {
            return this.hasEvent(event) && this.observers[event].length;
        },

        /**
         * Check if instance supports passed event.
         * @param {String} event
         * Event name.
         * @return {Boolean}
         */
        hasEvent: function (event) {
           return this.observers && this.observers.hasOwnProperty(event);     
        },

        /**
         * Check if passed event is muted
         * @param {String} event
         * Event name.
         * @return {Boolean}
         */
        isMuted: function (event) {
            return this.muteAllEvents || 
                this.mutedEvents && this.mutedEvents.hasOwnProperty(event);
        },

        /**
         * Fire impletentaion
         * @private
         * @param {String} event
         * Event name.
         * @param {Array} observers
         * Array with observers to call.
         * @param {Array} args
         * Array with arguments to pass to observers
         * @return {Boolean}
         * False if any handler returned false, true otherwise.
         */
        fireEventOnObservers: function (event, observers, args) {
            var result = true; 
            var o;

            for (var i = 0, l = observers.length; i < l; i++) {
                o = observers[i]; 
                try {
                    result = (o.fn.apply(o.scope, args) !== false) && result;
                } catch (ex) {
                    console && console.error && 
                        console.error(ex.message, ex.stack, ex);
                }
            }
            return result;
        },

        /**
         * Add handler to event
         * @param {String} event
         * Event name.
         * @param {Function} handler
         * Callback to call when event will be fired
         * @param {Object} scope
         * This value to set on callback call
         */
        on: function (event, handler, scope) {
            this.validateOnParameters(event, handler);
            
            var observers = this.observers[event];
            // check for duplicates
            for (var i = observers.length; --i >= 0;) {
                if (observers[i].fn === handler) {
                    return;
                }
            }

            // add observer
            this.observers[event].push({
                fn      : handler,
                scope   : scope || this
            });

        },

        /**
         * Check if parameters passed to method on are valid - event
         * is supported and handler is callable
         * @private
         * @param {String} event
         * Event name.
         * @param {Function} handler
         * Handler for event.
         */
        validateOnParameters: function (event, handler) {
            if (typeof handler !== 'function') {
                throw new TypeError('Passed handler is not callable!');
            }
            if (!this.hasEvent(event)) {
                throw new TypeError('Event ' + event + ' is not supported.' 
                    + 'Try to add this event with "addEvent" method.');
            }
        },

        /**
         * Remove event handler for passed event
         * @param {String} event
         * @param {Function} callback
         */
        off: function (event, callback) {
            if (this.hasEvent(event)) {
                var observers = this.observers[event];    
                for (var i = observers.length; --i >= 0;) {
                    if (observers[i].fn === callback) {
                        observers.splice(i, 1);
                        return;
                    }
                }
            }      
        },

        /**
         * Mute passed events. When event is muted its observers arent invoked
         * on event fire. If event name won't be passed all event will be muted
         * @param {String...} events
         * Events to mute (separated with coma).
         */
        mute: function (events) {
            if (arguments.length === 0) {
                this.muteAllEvents = true; 
            } else {
                if (!this.mutedEvents) {
                    this.mutedEvents = {};
                }
                events = Array.prototype.slice.call(arguments);
                for (var i = events.length; --i >= 0;) {
                    this.mutedEvents[events[i]] = true;        
                }
            }
        },

        /**
         * Unmute passed events. Unmute all when there is no arguments.
         * @param {String...} events
         * Event names separated with coma.
         */
        unMute: function (events) {
            // if there is no property thers is no muted events
            if (!this.mutedEvents) {
                return;
            }

            if (arguments.length === 0) {
                this.muteAllEvents = false;
                delete this.mutedEvents;
            } else {
                events = Array.prototype.slice.call(events);
                for (var i = events.length; --i >= 0;) {
                    delete this.mutedEvents[events[i]];
                }
            }    
        }
    };

    global.Observable = Observable;

}(window || this));
