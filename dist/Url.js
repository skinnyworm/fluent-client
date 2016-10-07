'use strict';

var isEmpty = require('lodash/isEmpty');
var defaultUrlBuilder = function defaultUrlBuilder(params) {
  return Promise.resolve(params);
};

var Url = function Url(apiBase, paramsBuilder) {
  paramsBuilder = paramsBuilder || defaultUrlBuilder;

  return function (path, params) {
    var url = [apiBase, path].join('');
    return paramsBuilder(params).then(function (params) {
      if (!isEmpty(params)) {
        var query = Object.keys(params).map(function (key) {
          return key + '=' + encodeURIComponent(params[key]);
        }).join('&');
        url = url + '?' + query;
      }
      return url;
    });
  };
};

module.exports = Url;