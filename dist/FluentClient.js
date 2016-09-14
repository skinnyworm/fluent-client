'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FluentClient;

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _buildMethod = require('./buildMethod');

var _buildMethod2 = _interopRequireDefault(_buildMethod);

var _Http = require('./Http');

var _Http2 = _interopRequireDefault(_Http);

var _templates = require('./templates');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function apiObject() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var path = opts.path;
  var config = opts.config;
  var http = opts.http;


  var remoteObject = function remoteObject(path, config) {
    return Object.keys(config).reduce(function (remote, prop) {
      var method = config[prop];
      if (typeof method === 'function') {
        remote[prop] = method(path, http);
      } else {
        remote[prop] = (0, _buildMethod2.default)(path, http, method);
      }
      return remote;
    }, {});
  };

  var functionObject = function functionObject(path, config) {
    var collection = config.collection;
    var instance = config.instance;
    var relations = config.relations;

    var fn = function fn(id) {
      var instancePath = path + '/' + id;
      var remoteObj = remoteObject(instancePath, instance);
      if (relations) {
        remoteObj = Object.assign(remoteObj, relationObject(instancePath, relations));
      }
      return remoteObj;
    };
    return Object.assign(fn, remoteObject(path, collection));
  };

  var relationObject = function relationObject(path, relations) {
    var one = relations.one;
    var many = relations.many;

    var relationObj = new Object();
    var relationPath = path + '/' + prop;

    if (many) {
      Object.keys(many).reduce(function (memo, prop) {
        var config = many[prop];
        memo[prop] = functionObject(relationPath, config);
        return memo;
      }, relationObj);
    }

    if (one) {
      Object.keys(one).reduce(function (memo, prop) {
        var config = one[prop];
        var remoteObj = remoteObject(relationPath, config.instance || {});
        if (config.relations) {
          remoteObj = Object.assign(remoteObj, relationObject(relationPath, config.relations));
        }
        memo[prop] = remoteObj;
        return memo;
      }, relationObj);
    }
    return relationObj;
  };

  return functionObject(path, config);
}

function buildConfig(template) {
  if (typeof template === 'function') {
    template = template();
  }

  var _config = template;

  return {
    config: function config() {
      return _config;
    },

    instance: function instance(methods) {
      _config = (0, _merge2.default)(_config, { instance: methods });
    },

    collection: function collection(methods) {
      _config = (0, _merge2.default)(_config, { collection: methods });
    },

    relation: function relation(opts, cfg) {
      var type = opts.type;
      var name = opts.name;
      var path = opts.path;
      var template = opts.template;


      if (!name) {
        throw "Must specify a relation name";
      }

      if (!type || ['one', 'many'].indexOf(type) < 0) {
        throw "Must specify relation type as one or many";
      }

      path = path || '/' + name;
      var relation = buildConfig(template || {});
      if (cfg) {
        cfg(relation);
      }

      _config = (0, _merge2.default)(_config, { relations: _defineProperty({}, type, _defineProperty({}, name, relation.config())) });
    }
  };
}

function FluentClient() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var defaultTemplate = opts.template;
  var defaultHttp = opts.http;

  var httpCfg = _objectWithoutProperties(opts, ['template', 'http']);

  var defaultOptions = {
    template: defaultTemplate,
    http: defaultHttp || (0, _Http2.default)(httpCfg)
  };

  return function (opts, cfg) {
    var _Object$assign = Object.assign({}, defaultOptions, opts);

    var template = _Object$assign.template;

    var apiOptions = _objectWithoutProperties(_Object$assign, ['template']);

    if (!template) {
      throw "Must define an api template";
    }

    if (!apiOptions.path) {
      throw "Must have path when define an api end point.";
    }

    var builder = buildConfig(template);
    if (cfg) {
      cfg(builder);
    }
    return apiObject(Object.assign({}, apiOptions, { config: builder.config() }));
  };
}