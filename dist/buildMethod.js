'use strict';

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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

/**
 * opts cal include following fields
 * - args -> mapping args from index to named props
 * - base -> uri base path to be override on location
 * - path -> uri path to be set on location
 * - location -> location object
 * - params -> alias to convertFn to convert props to actual request data
 * - data -> alias to convertFn to convert props to actual request data
 * - restPath -> flag to indicate if need to construct rest path
 *
 */
var resolveArgs = function resolveArgs(args, opts) {
  // args
  var props = void 0;
  if (opts.args) {
    props = namedArgs(opts.args, args);
  } else {
    props = args[0];
  }

  // merge location ids with props
  var location = (0, _merge2.default)({}, opts.location, { base: opts.base, path: opts.path });
  var base = location.base;
  var path = location.path;
  var relations = location.relations;

  var ids = _objectWithoutProperties(location, ['base', 'path', 'relations']);

  props = (0, _merge2.default)({}, props, ids);

  // need to convert props with customize function
  var convertFn = opts.params || opts.data;
  if (convertFn) {
    props = convertFn(props);
  }

  // make path from base
  var pathComponents = [base];

  // make rest path with id and relations
  if (opts.restPath) {
    if (props.id) {
      pathComponents = [].concat(_toConsumableArray(pathComponents), ["/:id"]);
    }

    if (relations) {
      var relationComponents = relations.map(function (relation) {
        var idKey = relation + 'Id';
        return props[idKey] ? '/' + relation + '/:' + idKey : '/' + relation;
      });
      pathComponents = [].concat(_toConsumableArray(pathComponents), _toConsumableArray(relationComponents));
    }
  }

  // append path to the end of location.
  if (path) {
    pathComponents = [].concat(_toConsumableArray(pathComponents), [path]);
  }

  return evalPath(pathComponents.join(''), props);
};

module.exports = function (location, http, config) {
  var verb = config.verb;
  var success = config.success;

  var others = _objectWithoutProperties(config, ['verb', 'success']);

  var opts = (0, _merge2.default)({ location: location }, others);

  var method = http[verb];
  if (!method) {
    throw 'Can not build method of verb: ' + verb;
  }

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _resolveArgs = resolveArgs(args, opts);

    var path = _resolveArgs.path;
    var props = _resolveArgs.props;

    return method(path, props).then(function (response) {
      return !!success ? success(response) : response;
    });
  };
};