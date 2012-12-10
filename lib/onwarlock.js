var httpserver = require('./httpserver.js');
exports.createServer = function (options) {
    options = options || {};

    var keys, app,
        key = options.key || process.cwd() + '/config/tsl.key',
        cert = options.cert || process.cwd() + '/config/tsl.cert';

    if (path.existsSync(key) && path.existsSync(cert)) {
        keys = {
            key: fs.readFileSync(key).toString('utf8'),
            cert: fs.readFileSync(cert).toString('utf8')
        };
    }

    if (keys) {
        app = require('express').createServer(keys);
    } else {
        app = require('express').createServer();
    }

    exports.init(app);

    return app;
};