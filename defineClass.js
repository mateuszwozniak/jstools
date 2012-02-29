(function (global) {
    
    /**
     * Create wrapper for super function 
     * @param {Function} fn - function to wrap
     * @param {Function} base - base function
     * @return {Function} wrapped function 
     */
    function createSuperWrap(fn, base) {
        return function () {
            var back = this.__super;
            this.__super = base || function () {};
            var result = fn.apply(this, arguments);
            this.__super = back;
            return result; 
        }
    }

    /**
     * Create class from base class and passed extensions
     * @param {Function} base class
     * @param {Object} extensions for new class
     * @return {Function} new class
     */
    function defineClass() {
        var firstart = typeof arguments[0];
        var constructor;

        var base = firstart === 'function' ? arguments[0] : function () {};
        var extensions = firstart === 'object' 
            ? arguments[0] : arguments[1] || {};

        // if there is Object.create method then use it to create copy of 
        // base prototype, othwerwise create new base instance 
        var proto = typeof Object.create === 'function' ? 
            Object.create(base.prototype) : new base();

        var property;
        // wrap all functions for provide base function
        var members = {};
        for (var propname in extensions) {
            if (extensions.hasOwnProperty(propname)) {
                property = extensions[propname];
                if (typeof property === 'function') {
                    members[propname] = createSuperWrap(property, 
                        proto[propname]);
                } else {
                    members[propname] = property;
                }
            } 
        }

        // check if property with name 'constructor' exist and if it is 
        // then cache it and remove from properties
        if (members.hasOwnProperty('constructor') && 
            typeof members.constructor === 'function') {
            constructor = members.constructor;
            delete members.constructor;
        }

        // copy properties from extension to new prototype object
        for (var name in members) {
            if (members.hasOwnProperty(name)) {
                proto[name] = members[name];                                     
            }
        }

        // new 'class'
        function Class() {
            constructor && constructor.apply(this, arguments);
        } 

        Class.prototype = proto; 
        Class.prototype.constructor = Class;
       
        return Class;
    }

    global.defineClass = defineClass;

}(window || this));
