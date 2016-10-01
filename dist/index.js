'use strict';

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var reduceTemplate = require('./reduceTemplate');
var Http = require('./Http');
var Url = require('./Url');
var Api = require('./Api');

var FluentClient = function FluentClient() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _template = opts.template;
  var _http = opts.http;

  var httpCfg = _objectWithoutProperties(opts, ['template', 'http']);

  var http = _http || Http(httpCfg);
  var api = { http: http };
  var define = function define(name, _ref, reduceFn) {
    var location = _ref.location;
    var template = _ref.template;

    var initial = template || _template;
    if (!initial) {
      throw "Must define an api template";
    }
    api[name] = Api({ location: location, http: http, template: reduceTemplate(initial, reduceFn) });
    return api;
  };

  return Object.assign(api, { define: define });
};

module.exports = {
  FluentClient: FluentClient,
  Http: Http,
  Url: Url
};