'use strict';

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * reduce function to initialize props
 */
function argsToProps(memo, opts) {
  var args = opts.args;
  var argNames = opts.argNames;

  var props = !argNames ? args[0] : argNames.reduce(function (memo, name, i) {
    return args[i] ? Object.assign(memo, _defineProperty({}, name, args[i])) : memo;
  }, {});
  return Object.assign(memo, { props: props || {} });
}

/**
 * reduce function to build path template from location
 */
function buildRestPathTemplate(memo, opts) {
  var _opts$location = opts.location;
  var base = _opts$location.base;
  var path = _opts$location.path;
  var relations = _opts$location.relations;

  var ids = _objectWithoutProperties(_opts$location, ['base', 'path', 'relations']);

  var props = memo.props;
  // make path from base

  var pathComponents = [base];
  // make rest path with id and relations
  if (ids.id) {
    pathComponents = [].concat(_toConsumableArray(pathComponents), ["/:id"]);
  }
  // merge relations and ids
  if (relations) {
    var relationComponents = relations.map(function (relation) {
      var idKey = relation + 'Id';
      return ids[idKey] ? '/' + relation + '/:' + idKey : '/' + relation;
    });
    pathComponents = [].concat(_toConsumableArray(pathComponents), _toConsumableArray(relationComponents));
  }
  //append path component
  if (path) {
    pathComponents = [].concat(_toConsumableArray(pathComponents), [path]);
  }

  // merge ids with props for path template
  props = Object.assign(props, ids);
  return Object.assign(memo, { props: props, pathTemplate: pathComponents.join('') });
}

/**
 * reduce function to resolve restful path from pathTemplate and props
 */
function resolvePath(memo, opts) {
  var convertFn = opts.convertFn;
  var props = memo.props;
  var pathTemplate = memo.pathTemplate;

  // convert props if necessary

  if (convertFn) {
    props = convertFn(props);
  }

  // process pathTemplate
  var path = pathTemplate.replace(/\/:[^\/]*/g, function (s) {
    var name = s.substr(2);
    var value = props[name];
    if (value) {
      delete props[name];
      return '/' + value;
    } else {
      return s;
    }
  });
  return Object.assign(memo, { path: path, props: props });
}

module.exports = function () {
  var buildConfig = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  return function (location, http, config) {
    var buildPathTemplate = config.buildPathTemplate || buildRestPathTemplate;
    var verb = config.verb;
    var success = config.success;
    var base = config.base;
    var path = config.path;
    var argNames = config.args;

    var convertFn = config.params || config.data;
    var method = http[verb];
    if (!method) {
      throw 'Can not build method of verb: ' + verb;
    }

    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var opts = { location: (0, _merge2.default)({}, location, { base: base, path: path }), args: args, convertFn: convertFn, argNames: argNames };

      var _reduce = [argsToProps, buildPathTemplate, resolvePath].reduce(function (memo, fn) {
        return fn(memo, opts);
      }, {});

      var uri = _reduce.path;
      var props = _reduce.props;


      return method(uri, props).then(function (response) {
        return !!success ? success(response) : response;
      });
    };
  };
};