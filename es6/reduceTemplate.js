const merge = require('lodash/merge');

const reduceTemplate = (initial, reduceFn)=>{
  let template = (typeof(initial) === 'function') ? initial() : initial;

  if(!reduceFn){
    return template;
  }

  const reducers = {
    instance(methods){
      template = merge({}, template, {instance: methods})
    },

    collection(methods){
      template = merge({}, template, {collection: methods})
    },

    relation(opts, reduceFn){
      let {type, name, path, template:relationTemplate} = opts;

      if(!name){
        throw "Must specify a relation name"
      }

      if(!type || ['one','many'].indexOf(type) < 0){
        throw "Must specify relation type as one or many"
      }

      template = merge({}, template, {
        relations: {
          [type]: {
            [name]: reduceTemplate(relationTemplate || {}, reduceFn)
          }
        }
      });
    }
  }

  reduceFn(reducers);
  return template;
}

module.exports = reduceTemplate;
