const buildMethod = require('./buildMethod');
const merge = require('lodash/merge');
const isEmpty = require('lodash/isEmpty');


const createApi = ({http, base, template:resourceTemplate})=>{
  /**
   * Build a function object from template
   */
  const functionObject = (location, template)=>{
    const {collection, instance, relations} = template;
    const remote = remoteObject(location, collection)
    const fn = (id)=>{

      let instanceLocation
      if(!isEmpty(location.relations)){
        const relation = location.relations[location.relations.length - 1];
        instanceLocation = merge({[`${relation}Id`]: id}, location);
      }else{
        instanceLocation = merge({id: id}, location)
      }

      let remoteObj = remoteObject(instanceLocation, instance);
      if(relations){
        remoteObj = Object.assign(remoteObj, relationObject(instanceLocation, relations));
      }
      return remoteObj;
    }

    return Object.assign(fn, remote);
  };

  /**
   * Build a remote object from template
   */
  const remoteObject = (location, template)=>{
    if(!template){
      return {};
    }

    return Object.keys(template).reduce((remote, prop)=>{
      const method = template[prop];
      if(typeof(method) === 'function'){
        remote[prop] = method(location, http);
      }else{
        remote[prop] = buildMethod(location, http, merge({restPath: !!resourceTemplate.restPath}, method));
      }
      return remote;
    }, {});
  };

  /**
   * Build a relation object from template
   */
  const relationObject = (location, relations)=>{
    const {one, many} = relations
    const relationObj = new Object();

    if(many){
      Object.keys(many).reduce((memo, relationName)=>{
        let template = many[relationName];
        let relationLocation = merge({relations: [...location.relations||[], relationName]}, location);

        memo[relationName] = functionObject(relationLocation, template);
        return memo;
      }, relationObj)
    }

    if(one){
      Object.keys(one).reduce((memo, relationName)=>{
        let template = one[relationName];
        let relationLocation = merge({relations: [...location.relations||[], relationName]}, location);

        let remoteObj = remoteObject(relationLocation, template.instance || {});
        if(template.relations){
          remoteObj = Object.assign(remoteObj, relationObject(relationLocation, template.relations));
        }
        memo[relationName] = remoteObj;
        return memo;
      }, relationObj);
    }
    return relationObj;
  };

  return functionObject({base}, resourceTemplate)
}

module.exports = createApi;
