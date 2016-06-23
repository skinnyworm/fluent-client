'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.headerBuilder = exports.urlBuilder = exports.jsonFormat = undefined;
exports.default = Http;

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonFormat = exports.jsonFormat = {
  encode: function encode(data) {
    if (data) {
      return {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    } else {
      return {};
    }
  },

  decode: function decode(response) {
    var contentType = response.headers.get('Content-Type');
    var contentLength = response.headers.get('Content-Length');
    return response.json().catch(function (err) {
      return {};
    }).then(function (json) {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    });
  }
};

var urlBuilder = exports.urlBuilder = function urlBuilder(apiBase) {
  var defaultParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return function buildUrl(path) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (typeof defaultParams === 'function') {
      params = (0, _merge2.default)({}, params, defaultParams());
    } else {
      params = (0, _merge2.default)({}, params, defaultParams);
    }

    var url = [apiBase, path].join('');
    if (!(0, _isEmpty2.default)(params)) {
      var query = Object.keys(params).map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
      }).join('&');
      url = url + '?' + query;
    }
    return url;
  };
};

var headerBuilder = exports.headerBuilder = function headerBuilder() {
  var defaultHeaders = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return function buildHeaders() {
    var headers = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (typeof defaultHeaders === 'function') {
      return (0, _merge2.default)({}, headers, defaultHeaders());
    } else {
      return (0, _merge2.default)({}, headers, defaultHeaders);
    }
  };
};

function Http() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var buildUrl = opts.url;
  var buildHeaders = opts.headers;
  var format = opts.format;


  buildUrl = buildUrl || urlBuilder('http://localhost');
  buildHeaders = buildHeaders || headerBuilder();
  format = format || jsonFormat;

  return {
    get: function get(path) {
      var params = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return fetch(buildUrl(path, params), {
        method: 'GET',
        headers: buildHeaders()
      }).then(format.decode);
    },
    post: function post(path, data) {
      var _format$encode = format.encode(data);

      var body = _format$encode.body;
      var contentTypeHeaders = _format$encode.headers;

      var fetchOptions = {
        method: 'POST',
        headers: buildHeaders(contentTypeHeaders)
      };
      if (!(0, _isEmpty2.default)(body)) {
        fetchOptions = (0, _merge2.default)(fetchOptions, { body: body });
      }
      return fetch(buildUrl(path), fetchOptions).then(format.decode);
    },
    put: function put(path, data) {
      var _format$encode2 = format.encode(data);

      var body = _format$encode2.body;
      var contentTypeHeaders = _format$encode2.headers;

      var fetchOptions = {
        method: 'PUT',
        headers: buildHeaders(contentTypeHeaders)
      };
      if (!(0, _isEmpty2.default)(body)) {
        fetchOptions = (0, _merge2.default)(fetchOptions, { body: body });
      }
      return fetch(buildUrl(path), fetchOptions).then(format.decode);
    },
    delete: function _delete(path, data) {
      var _format$encode3 = format.encode(data);

      var body = _format$encode3.body;
      var contentTypeHeaders = _format$encode3.headers;

      var fetchOptions = {
        method: 'DELETE',
        headers: buildHeaders(contentTypeHeaders)
      };

      if (!(0, _isEmpty2.default)(body)) {
        fetchOptions = (0, _merge2.default)(fetchOptions, { body: body });
      }

      return fetch(buildUrl(path), fetchOptions).then(format.decode);
    }
  };
}