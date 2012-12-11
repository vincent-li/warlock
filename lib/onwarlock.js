var fs = require('fs');
var path = require('path');
//var singularize = require("../vendor/inflection").singularize;
var utils = require('./warlock_utils');
var safe_merge = utils.safe_merge;
var Map = require('routes').Map;
require('coffee-script');

function Warlock() {

    global.app   = this;
    this.locales     = require('./locales');
    this.utils       = require('./warlock_utils');
    this.ControllerBridge = require('./controller_bridge');
    this.tools       = require('./tools');
    this.logger      = require('./logger');
    this.routeMapper = new Map(app, this.ControllerBridge.uniCaller);
    this.helpers     = require('./helpers');
    this.models      = require('./models');
    this.websocketapp= require('./websocketserver');
    this.httpapp     = require('./httpserver');

}
exports.createServer = function (options) {
    var app = httpserver.createServer();
    return app;
};