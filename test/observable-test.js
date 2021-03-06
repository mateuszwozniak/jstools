(function () {

    buster.testCase('Observable', {

        'should be function': function () {
            assert.isFunction(Observable);
        }
    });

    buster.testCase('Observable#addEvents', {
        'should add passed event names to "observers" property': function () {
            var o = createObservable();
            o.addEvents('foo', 'bar');
            assert.equals(o.observers, { 'foo': [], 'bar': [] });
        },

        'should not override existing observers': function () {
            var o = createObservable();
            o.addEvents('foo', 'bar');
            var foo = o.observers['foo'];
            o.addEvents('foo');
            assert.same(o.observers['foo'], foo);
        }
    });

    buster.testCase('Observable#hasEvent', {

        'should return true if instance has passed event': function () {
            var o = createObservableWithEvent();
            assert(o.hasEvent(evt));
        },

        'should return true if instance has passed event': function () {
            var o = createObservable();
            refute(o.hasEvent(evt));
        },

        'should not throw errors when observers property is not crated': function () {
            var o = createObservable();
            refute.exception(function () {
                o.hasEvent(evt); 
            });
        }
    });

    buster.testCase('Observable#hasObservers', {
    
        'should return true if there are any observers for event': function () {
            var o = createObservableWithEvent();
            o.on(evt, function () {}); 
            assert(o.hasObservers(evt));
        }
    });

    buster.testCase('Observable#on', {

        'should throw error when try to add event which is not supported': function () {
            var o = createObservable();
            assert.exception(function () {
                o.on('foo', function () {});
            }, 'TypeError');
        },

        'should add event handler for passed event': function () {
            var o   = createObservableWithEvent();
            var cb  = function () {};
            
            o.on(evt, cb);
            assert.same(o.observers[evt][0].fn, cb);
        },

        'should add only one instance of handler': function () {
            var o   = createObservableWithEvent();
            var fn  = function () {};

            o.on(evt, fn);
            o.on(evt, fn);
            assert.equals(o.observers[evt].length, 1);
        },

        'should throw error when handler is not callable': function () {
            var o = createObservableWithEvent();
            var handler = {};
            assert.exception(function () {
                o.on(evt, handler);
            }, 'TypeError');
        }
    });

    buster.testCase('Observable#off', {

        'should remove passed handler for passed event': function () {
            var o   = createObservableWithEvent();
            var fn  = function () {};

            o.on(evt, fn); 
            o.off(evt, fn);
            assert.equals(o.observers[evt].length, 0);
        },

        'removed handler should not be called when event fires': function () {
            var o   = createObservableWithEvent();
            var fn  = sinon.spy();

            o.on(evt, fn); 
            o.off(evt, fn);
            o.fire(evt);
            
            refute.called(fn);
        }
    });

    buster.testCase('Observable#fire', {

        'should invoke all observers for event': function() {
            var o   = createObservableWithEvent();
            var fn  = sinon.spy();
            
            o.on(evt, fn);
            o.fire(evt);
            
            assert.calledOnce(fn);
        },
        
        'observers should be called on observer object itself when scope was not passed': function () {
            var o = createObservableWithEvent(); 
            var fn = sinon.spy();
            o.on(evt, fn);
            o.fire(evt);
            assert(fn.calledOn(o));
        },

        'observers should be called on passed scope when passed': function () {
            var o = createObservableWithEvent();
            var fn = sinon.spy(); 
            var sc = {};

            o.on(evt, fn, sc);
            o.fire(evt);
            assert(fn.calledOn(sc));
        },


        'all observers should be called once even if any of them fail': function () {
            var o   = createObservableWithEvent(); 
            var fn1 = sinon.spy();
            var fn2 = sinon.spy(function () {
                throw new Error('Error in handler!');
            });

            o.on(evt, fn1);
            o.on(evt, fn2);

            o.fire(evt);
        
            assert(fn1.calledOnce); 
            assert(fn2.calledOnce);
        },

        'should return false if any of observers returned false': function () {
            var o   = createObservableWithEvent(); 
            var fn1 = function () {};
            var fn2 = function () {
                return false; 
            };

            o.on(evt, fn1);
            o.on(evt, fn2);

            assert.same(o.fire(evt), false);
        },

        'observer should be called with parameters passed to fire': function () {
            var o   = createObservableWithEvent();      
            var fn  = sinon.spy();
            var a   = [1, 'foo', { bar: 'bar' }];

            o.on(evt, fn);
            o.fire(evt, a[0], a[1], a[2]);
            assert(fn.calledWithExactly(a[0], a[1], a[2]));
        }
    });
    
    buster.testCase('Observer#muteEvents', {

        'called with parameters should mute passed events' : function() {
            var o    = createObservableWithEvent();

            o.addEvents(evt2);

            o.mute(evt);
            
            assert(o.isMuted(evt));
            refute(o.isMuted(evt2));
        },
        
        'called without parameters should mute all events': function () {
            var o    = createObservableWithEvent();
            
            var f1  = sinon.spy();
            var f2  = sinon.spy();
 
            o.on(evt, f1);
            o.on(evt, f2);

            o.mute();
            o.fire(evt);
            o.fire(evt2);

            refute(f1.called);
            refute(f2.called);
        }
    });

    buster.testCase('Observable#isMuted', {

        'should return true for muted event': function () {
            var o = createObservableWithEvent();
            o.mute(evt);
            assert(o.isMuted(evt));
        },

        'should return true for each event if all event are muted': function () {
            var o = createObservableWithEvent();

            o.addEvents(evt2);
            o.mute();

            assert(o.isMuted(evt));
            assert(o.isMuted(evt2));
        }
    });

    buster.testCase('Observable#unMute', {

        'called without parameters should remove unmute all events': function () {
            var o = createObservableWithEvent(); 
            o.mute(evt);
            o.unMute();
            refute(o.isMuted(evt));
        },

        'called with parameters should unmute passed events': function () {
            var o    = createObservableWithEvent();  
            o.addEvents(evt2);
            o.mute();
            o.unMute(evt);

            assert(o.isMuted(evt));
            assert(o.isMuted(evt2));
        }

    }); // eof testCase

////////////////////////////////////////////////////////////////////////////////
// helpers

    var evt     = 'foo';
    var evt2    = 'bar';

    function createObservable() {
        var o = new Observable();
        return o;
    }

    function createObservableWithEvent () {
        var o = new Observable();
        o.addEvents(evt);
        return o;
    }

}());
