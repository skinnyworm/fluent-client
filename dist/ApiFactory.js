'use strict';

var createApi = require('./createApi');
var reduceTemplate = require('./reduceTemplate');

module.exports = function ApiFactory(opts) {
  var http = opts.http;
  var baseTemplate = opts.template;

  if (!http) {
    throw "Must provide a http instance.";
  }

  return function (_ref, reduceFn) {
    var base = _ref.base;
    var template = _ref.template;

    var initial = template || baseTemplate;
    if (!initial) {
      throw "Must define an api template";
    }
    return createApi({ http: http, base: base, template: reduceTemplate(initial, reduceFn) });
  };
};