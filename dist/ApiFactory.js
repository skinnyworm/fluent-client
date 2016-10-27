'use strict';

var createApi = require('./createApi');
var reduceTemplate = require('./reduceTemplate');

module.exports = function ApiFactory(_ref) {
  var http = _ref.http;
  var baseTemplate = _ref.template;

  if (!http) {
    throw "Must provide a http instance.";
  }

  return function (_ref2, reduceFn) {
    var base = _ref2.base;
    var template = _ref2.template;

    var initial = template || baseTemplate;
    if (!initial) {
      throw "Must define an api template";
    }
    return createApi({ http: http, base: base, template: reduceTemplate(initial, reduceFn) });
  };
};