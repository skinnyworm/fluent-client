'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var buildMethod = require('./buildMethod');
var merge = require('lodash/merge');
var isEmpty = require('lodash/isEmpty');

var Api = function Api(_ref) {
  var base = _ref.base;
  var resourceTemplate = _ref.template;
  var http = _ref.http;

  /**
   * Build a function object from template
   */
  var functionObject = function functionObject(location, template) {
    var collection = template.collection;
    var instance = template.instance;
    var relations = template.relations;

    var remote = remoteObject(location, collection);
    var fn = function fn(id) {

      var instanceLocation = void 0;
      if (!isEmpty(location.relations)) {
        var relation = location.relations[location.relations.length - 1];
        instanceLocation = merge(_defineProperty({}, relation + 'Id', id), location);
      } else {
        instanceLocation = merge({ id: id }, location);
      }

      var remoteObj = remoteObject(instanceLocation, instance);
      if (relations) {
        remoteObj = Object.assign(remoteObj, relationObject(instanceLocation, relations));
      }
      return remoteObj;
    };

    return Object.assign(fn, remote);
  };

  /**
   * Build a remote object from template
   */
  var remoteObject = function remoteObject(location, template) {
    if (!template) {
      return {};
    }

    return Object.keys(template).reduce(function (remote, prop) {
      var method = template[prop];
      if (typeof method === 'function') {
        remote[prop] = method(location, http);
      } else {
        remote[prop] = buildMethod(location, http, merge({ restPath: !!resourceTemplate.restPath }, method));
      }
      return remote;
    }, {});
  };

  /**
   * Build a relation object from template
   */
  var relationObject = function relationObject(location, relations) {
    var one = relations.one;
    var many = relations.many;

    var relationObj = new Object();

    if (many) {
      Object.keys(many).reduce(function (memo, relationName) {
        var template = many[relationName];
        var relationLocation = merge({ relations: [].concat(_toConsumableArray(location.relations || []), [relationName]) }, location);

        memo[relationName] = functionObject(relationLocation, template);
        return memo;
      }, relationObj);
    }

    if (one) {
      Object.keys(one).reduce(function (memo, relationName) {
        var template = one[relationName];
        var relationLocation = merge({ relations: [].concat(_toConsumableArray(location.relations || []), [relationName]) }, location);

        var remoteObj = remoteObject(relationLocation, template.instance || {});
        if (template.relations) {
          remoteObj = Object.assign(remoteObj, relationObject(relationLocation, template.relations));
        }
        memo[relationName] = remoteObj;
        return memo;
      }, relationObj);
    }
    return relationObj;
  };

  return functionObject({ base: base }, resourceTemplate);
};

module.exports = Api;