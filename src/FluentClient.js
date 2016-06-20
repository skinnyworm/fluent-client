import merge from 'lodash/merge';
import buildMethod from './buildMethod';
import {Http} from './Http';
import {RestfulModel} from './templates';

function apiObject(opts={}){
  const {path, config, http} = opts;

  const remoteObject = (path, config)=>{
    return Object.keys(config).reduce((remote, prop)=>{
      const method = config[prop];
      if(typeof(method) === 'function'){
        remote[prop] = method(path, http);
      }else{
        remote[prop] = buildMethod(path, http, method);
      }
      return remote;
    }, {});
  };

  const relationObject = (path, relations)=>{
    const {one, many} = relations
    const relationObj = new Object();

    if(many){
      Object.keys(many).reduce((memo, prop)=>{
        let config = many[prop];
        memo[prop] = functionObject(`${path}/${prop}`, config);
        return memo;
      }, relationObj)
    }

    if(one){
      Object.keys(one).reduce((memo, prop)=>{
        let config = one[prop];
        let relationPath = `${path}/${prop}`
        let remoteObj = remoteObject(relationPath, config.instance || {});
        if(config.relations){
          remoteObj = Object.assign(remoteObj, relationObject(relationPath, config.relations));
        }
        memo[prop] = remoteObj;
        return memo;
      }, relationObj);
    }
    return relationObj;
  };

  const functionObject = (path, config)=>{
    const {collection, instance, relations} = config;
    const fn = (id)=>{
      const instancePath = `${path}/${id}`
      let remoteObj = remoteObject(instancePath, instance);
      if(relations){
        remoteObj = Object.assign(remoteObj, relationObject(instancePath, relations));
      }
      return remoteObj;
    }
    return Object.assign(fn, remoteObject(path, collection));
  };

  return functionObject(path, config);
}



function buildConfig(initial){
  let _config = initial;

  return{
    config: ()=>_config,

    instance: (methods)=>{
      _config = merge(_config, {instance: methods})
    },

    collection: (methods)=>{
      _config = merge(_config, {collection: methods})
    },

    relation: (opts, cfg)=>{
      let {type, name, path} = opts;

      if(!name){
        throw "Must specify a relation name"
      }

      if(!type || ['one','many'].indexOf(type) < 0){
        throw "Must specify relation type as one or many"
      }

      path = path || `/${name}`
      const relation = buildConfig({}||base)
      cfg(relation);
      _config = merge(_config, {relations: {[type]: {[name]: relation.config()}}})
    }
  }
}


export default function FluentClient(opts={}){
  const {url, headers, format} = opts;
  const defaultOptions = {
    http: opts.http || Http({url, headers, format}),
    template: opts.template || RestfulModel
  }

  return function(opts, cfg){
    let {template, ...apiOptions} = Object.assign({}, defaultOptions, opts)
    if(!apiOptions.path){
      throw "Must have path when define an api end point."
    }

    const builder = buildConfig(template);
    if(cfg){
      cfg(builder)
    }
    return apiObject(Object.assign({}, apiOptions, {config:builder.config()}));
  }
}
