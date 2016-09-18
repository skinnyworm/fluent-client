'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var merge = require('lodash/merge');

var jsonDecode = function jsonDecode(response) {
  return response.json().then(function (json) {
    if (!response.ok) {
      return Promise.reject(json);
    }
    return json;
  });
};

var jsonEncode = function jsonEncode(data) {
  var body = JSON.stringify(data) || '';
  return {
    headers: { 'Content-Type': 'application/json' },
    body: body
  };
};

/**
 * @param fetch:function  - fetch implementation
 * @param url - A function to resolve url (path:String, params:Object):String
 * @param encode - A function to encode request body from object
 * @param decode - A function to decode response body to object
 * @param init - A function to resolve init options for fetch request
 */
var Http = function Http(_ref) {
  var fetch = _ref.fetch;
  var url = _ref.url;
  var encode = _ref.encode;
  var decode = _ref.decode;
  var init = _ref.init;

  encode = encode || jsonEncode;
  decode = decode || jsonDecode;

  function resolve(path, params) {
    return Promise.all([url(path, params), init && init()]);
  }

  var requestWithParams = function requestWithParams(method) {
    return function (path, params) {
      return resolve(path, params).then(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2);

        var url = _ref3[0];
        var config = _ref3[1];
        return fetch(url, merge({}, config, { method: method }));
      }).then(function (response) {
        return decode(response);
      });
    };
  };

  var requestWithBody = function requestWithBody(method) {
    return function (path, data) {
      return resolve(path).then(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2);

        var url = _ref5[0];
        var config = _ref5[1];
        return fetch(url, merge({}, config, encode(data), { method: method }));
      }).then(function (response) {
        return decode(response);
      });
    };
  };

  return {
    get: requestWithParams('GET'),
    delete: requestWithParams('DELETE'),
    post: requestWithBody('POST'),
    put: requestWithBody('PUT')
  };
};

module.exports = Http;