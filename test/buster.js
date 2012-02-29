var config = module.exports;

config['browser'] = {
    environment : 'browser',
    sources     : [
        '../defineClass.js',
        '../observable.js'
    ],
    tests       : [
        '*-test.js'
    ]
};

