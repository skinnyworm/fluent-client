'use strict';

var buildMethod = require('./buildMethod');

var Api = function Api(_ref) {
  var location = _ref.location;
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
      var instanceLocation = location + '/' + id;
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
        remote[prop] = buildMethod(location, http, method);
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
        var relationLocation = location + '/' + relationName;

        memo[relationName] = functionObject(relationLocation, template);
        return memo;
      }, relationObj);
    }

    if (one) {
      Object.keys(one).reduce(function (memo, relationName) {
        var template = one[relationName];
        var relationLocation = location + '/' + relationName;

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

  // return (pathStr, template)=>{
  //   const path = UrlPath(pathStr);
  //   return functionObject(path, template);
  // }

  return functionObject(location, resourceTemplate);
};

module.exports = Api;