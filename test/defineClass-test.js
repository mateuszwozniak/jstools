buster.testCase('defineClass', {

    setUp: function () {
        this.foo = function () {};
    },

    'should exists': function () {
        assert.isFunction(defineClass);
    },

    'should return function': function () {
        assert.isFunction(defineClass());
    },

    'returned function should create instance of function passed as first param': function () {
        var bar = defineClass(this.foo);
        var t = new bar();

        assert.isObject(t);
        assert(t instanceof this.foo);
    },

    'prototype of returned function should be instace of function passed as first param': function () {
        var bar = defineClass(this.foo);
        assert(bar.prototype instanceof this.foo);
    },

    'object crated with new constructor should have fields passed as second param': function () {
        var def = {
            foobar: 1,
            foobarfun: function () {
                return 2;
            }
        };
        
        var bar = defineClass(this.foo, def);

        var t = new bar();
        
        assert.equals(t.foobar, def.foobar);
        // check if property is function
        assert.isFunction(t.foobarfun);
        assert.equals(t.foobarfun(), 2);
    },

    'method constructor from extensions should be called on object instantation': function () {
        var spy = sinon.spy();
        var ext = {
            constructor: spy
        };

        var foo = defineClass(function () {}, ext);
        new foo();
        assert.called(spy);
    },

    'method constructor should be called with arguments passed to constructor function': function () {
        var spy = sinon.spy();
        var ext = {
            constructor: spy
        };
        var a = [1, {f: 'a'}, 'Test'];  
        var Foo = defineClass(ext);
        b = new Foo(a[0], a[1], a[2]);

        assert.calledWith(spy, a[0], a[1], a[2]); 
    }, 

    'new class methods should be able to call __super method': function () {
        var foo = {
            methodA: function () { }
        };

        var bar = {
            methodA: function () {
                assert.isFunction(this.__super);
            }
        }
    
        var clsA = defineClass(foo);
        var clsB = defineClass(clsA, bar);
        var b = new clsB();
        b.methodA();
    },

    'calling __super method should call method with the same name from base class': function () {
        var spy = sinon.spy();
        var baseProto = {
            foo: spy
        };

        var extProto = {
            foo: function () {
                this.__super(); 
            } 
        };

        var Foo = defineClass(baseProto);
        var Bar = defineClass(Foo, extProto);
        
        var b = new Bar();
        b.foo();

        assert.called(spy);
    },

    'constructor chain should be called': function () {
        var fna = function () { this.__super(); };
        var fnb = function () { this.__super(); };

        var spya = sinon.spy();
        var spyb = sinon.spy(fna);
        var spyc = sinon.spy(fnb);

        var exta = { constructor: spya };
        var extb = { constructor: spyb };
        var extc = { constructor: spyc };
        
        var Foo = defineClass(exta);
        var Bar = defineClass(Foo, extb);
        var FooBar = defineClass(Bar, extc);

        var tmp = new FooBar();

        if (typeof Object.create === 'function') {
            assert.calledOnce(spyc);
            assert.calledOnce(spyb);
            assert.calledOnce(spya);
        } else {
            // should be called only one when class is created
            assert.calledOnce(spyc);
            // should be called twice - one extra for class FooBar creation
            assert.calledTwice(spyb);
            // should be called trice - one extra for FooBar creation and 
            // one extra for Bar creation
            assert.calledThrice(spya);
        }
    },

    'crated class should have properties from all base classes': function () {
        var a = { foo: function () {} };
        var b = { bar: function () {} };
        var c = { foobar: 1 };

        var Foo = defineClass(a);
        var Bar = defineClass(Foo, b);
        var FooBar = defineClass(Bar, c);
        
        var f = new FooBar();
         
        assert.defined(f.foobar);
        assert.isFunction(f.foo);
        assert.isFunction(f.bar);
    }
});
