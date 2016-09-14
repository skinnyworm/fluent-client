'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonEncode = function jsonEncode(data) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  };
};

var jsonDecode = function jsonDecode(response) {
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
};

var Http = function Http() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


  var url = opts.url || Http.urlBuilder('http://localhost');
  var headers = opts.headers || Http.headerBuilder();
  var encode = opts.encode || jsonEncode;
  var decode = opts.decode || jsonDecode;
  var fetch = opts.fetch || _isomorphicFetch2.default;

  return {
    get: function get(path) {
      var params = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return fetch(url(path, params), {
        method: 'GET',
        headers: headers()
      }).then(decode);
    },
    post: function post(path, data) {
      var _encode = encode(data);

      var body = _encode.body;
      var contentTypeHeaders = _encode.headers;

      var fetchOptions = {
        method: 'POST',
        headers: headers(contentTypeHeaders)
      };

      fetchOptions = (0, _merge2.default)(fetchOptions, { body: body || {} });
      return fetch(url(path), fetchOptions).then(decode);
    },
    put: function put(path, data) {
      var _encode2 = encode(data);

      var body = _encode2.body;
      var contentTypeHeaders = _encode2.headers;

      var fetchOptions = {
        method: 'PUT',
        headers: headers(contentTypeHeaders)
      };

      fetchOptions = (0, _merge2.default)(fetchOptions, { body: body || {} });
      return fetch(url(path), fetchOptions).then(decode);
    },
    delete: function _delete(path, data) {
      var _encode3 = encode(data);

      var body = _encode3.body;
      var contentTypeHeaders = _encode3.headers;

      var fetchOptions = {
        method: 'DELETE',
        headers: headers(contentTypeHeaders)
      };

      fetchOptions = (0, _merge2.default)(fetchOptions);
      return fetch(url(path), fetchOptions).then(decode);
    }
  };
};

Http.urlBuilder = function (apiBase) {
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

Http.headerBuilder = function () {
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

exports.default = Http;