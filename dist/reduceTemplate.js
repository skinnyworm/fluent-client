'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var merge = require('lodash/merge');

var reduceTemplate = function reduceTemplate(initial, reduceFn) {
  var template = typeof initial === 'function' ? initial() : initial;

  if (!reduceFn) {
    return template;
  }

  var reducers = {
    instance: function instance(methods) {
      template = merge({}, template, { instance: methods });
    },
    collection: function collection(methods) {
      template = merge({}, template, { collection: methods });
    },
    relation: function relation(opts, reduceFn) {
      var type = opts.type;
      var name = opts.name;
      var path = opts.path;
      var relationTemplate = opts.template;


      if (!name) {
        throw "Must specify a relation name";
      }

      if (!type || ['one', 'many'].indexOf(type) < 0) {
        throw "Must specify relation type as one or many";
      }

      template = merge({}, template, {
        relations: _defineProperty({}, type, _defineProperty({}, name, reduceTemplate(relationTemplate || {}, reduceFn)))
      });
    }
  };

  reduceFn(reducers);
  return template;
};

module.exports = reduceTemplate;