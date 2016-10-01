'use strict';

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var remote = function remote(http) {

  var namedArgs = function namedArgs(argNames, args) {
    return argNames.reduce(function (memo, name, i) {
      var arg = args[i];
      if (arg) {
        memo[name] = arg;
      }
      return memo;
    }, {});
  };

  var evalPath = function evalPath(path, props) {
    path = path.replace(/\/:[^\/]*/g, function (s) {
      var name = s.substr(2);
      var value = props[name];
      if (value) {
        delete props[name];
        return '/' + value;
      } else {
        return s;
      }
    });
    return { path: path, props: props };
  };

  var resolveArgs = function resolveArgs(args, opts) {
    var argNames = opts.args;
    var location = opts.location;
    var path = opts.path;
    var convertFn = opts.convertFn;
    var props = opts.props;


    if (!argNames) {
      return { path: [location, path].join(''), props: props };
    } else {
      props = namedArgs(argNames, args);

      /** need to evaluate path components*/
      if (path && path.match(/\/:[^\/]*/)) {
        var _evalPath = evalPath(path, props);

        var props = _evalPath.props;
        var path = _evalPath.path;
      }

      /** need to convert props with customize function*/
      if (convertFn) {
        props = convertFn(props);
      }

      /** FIXME:: Make empty object as undefined props? **/
      if ((0, _isEmpty2.default)(props)) {
        props = undefined;
      }

      return { path: [location, path].join(''), props: props };
    }
  };

  var successFn = function successFn(_ref) {
    var success = _ref.success;

    return !!success ? success : function (result) {
      return result;
    };
  };

  return {
    get: function get(location, opts) {
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var _resolveArgs = resolveArgs(args, (0, _merge2.default)({ location: location, props: undefined, convertFn: opts.params }, opts));

        var path = _resolveArgs.path;
        var params = _resolveArgs.props;

        return http.get(path, params).then(successFn(opts));
      };
    },

    delete: function _delete(location, opts) {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var _resolveArgs2 = resolveArgs(args, (0, _merge2.default)({ location: location, props: undefined, convertFn: opts.params }, opts));

        var path = _resolveArgs2.path;
        var data = _resolveArgs2.props;

        return http.delete(path, data).then(successFn(opts));
      };
    },

    post: function post(location, opts) {
      return function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var _resolveArgs3 = resolveArgs(args, (0, _merge2.default)({ location: location, props: args[0], convertFn: opts.data }, opts));

        var path = _resolveArgs3.path;
        var data = _resolveArgs3.props;

        return http.post(path, data).then(successFn(opts));
      };
    },

    put: function put(location, opts) {
      return function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        var _resolveArgs4 = resolveArgs(args, (0, _merge2.default)({ location: location, props: args[0], convertFn: opts.data }, opts));

        var path = _resolveArgs4.path;
        var data = _resolveArgs4.props;

        return http.put(path, data).then(successFn(opts));
      };
    }
  };
};

var buildMethod = function buildMethod(uri, http, config) {
  var verb = config.verb;

  var opts = _objectWithoutProperties(config, ['verb']);

  var method = remote(http)[verb];
  if (!method) {
    throw 'Can not build method of verb: ' + verb;
  }
  return method(uri, opts);
};

module.exports = buildMethod;