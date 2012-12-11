function HttpServer() {

    global.happ   = this;

    this.locales     = require('./locales');
    this.utils       = require('./railway_utils');

    this.ControllerBridge = require('./controller_bridge');


    this.tools       = require('./tools');
    this.logger      = require('./logger');
    this.routeMapper = new Map(app, this.ControllerBridge.uniCaller);

    this.helpers     = require('./helpers');

    //this.models      = require('./models');

    this.webss = require('./websocketserver');

}

try {
    if (process.versions.node < '0.6') {
        Railway.prototype.version = JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version;
    } else {
        Railway.prototype.version = require('../package').version;
    }
}catch(e){}

exports.init = function (app) {
    if (arguments.length == 2) {
        app = arguments[1];
    }
    
    // globalize app object
    global.app = app;
    app.root = process.cwd();

    // create API publishing object
    new Railway();

    // run environment.{js|coffee} and environments/{test|development|production}.{js|coffee}
    configureApp();

    // controllers should be loaded before extensions
    railway.controller.init();
    // extensions should be loaded before server startup
    railway.extensions.init();

    railway.models.init();

    // run config/initializers/*
    runInitializers();

    if (path.existsSync(app.root + '/config') && (path.existsSync(app.root + '/config/routes.js') || path.existsSync(app.root + '/config/routes.coffee'))) {
        railway.routeMapper.addRoutes(app.root + '/config/routes');
    }

    process.nextTick(function () {

        railway.locales.init();
        railway.logger.init();
        app.reloadModels = railway.models.loadModels;

        loadObservers();

        if (app.enabled('merge javascripts')) {
            ensureDirClean(app.root + '/public' + app.set('jsDirectory') + 'cache');
        }

        if (app.enabled('merge stylesheets')) {
            ensureDirClean(app.root + '/public' + app.set('cssDirectory') + 'cache');
        }

    });
};
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

    //exports.init(app);

    return app;
};