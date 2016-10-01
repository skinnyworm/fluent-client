import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';

const remote = (http)=>{

  const namedArgs = (argNames, args)=>{
    return argNames.reduce((memo, name, i)=>{
      const arg = args[i];
      if(arg){
        memo[name] = arg;
      }
      return memo;
    },{});
  }

  const evalPath = (path, props)=>{
    path = path.replace(/\/:[^\/]*/g, (s)=>{
      const name = s.substr(2);
      const value = props[name];
      if(value){
        delete(props[name]);
        return `/${value}`
      }else{
        return s;
      }
    });
    return {path, props}
  }

  const resolveArgs = (args, opts)=>{
    var {args:argNames, location, path, convertFn, props} =  opts;

    if(!argNames){
      return {path:[location, path].join(''), props}
    }else{
      props = namedArgs(argNames, args);

      /** need to evaluate path components*/
      if(path && path.match(/\/:[^\/]*/)){
        var {props, path} = evalPath(path, props);
      }

      /** need to convert props with customize function*/
      if(convertFn){
        props = convertFn(props)
      }

      /** FIXME:: Make empty object as undefined props? **/
      if(isEmpty(props)){
        props = undefined;
      }

      return {path:[location, path].join(''), props};
    }
  }

  const successFn = ({success})=>{
    return !!success ? success : (result)=>result;
  }

  return{
    get: (location, opts)=> (...args)=>{
      const {path, props:params} = resolveArgs(args, merge({location, props:args[0], convertFn:opts.params},opts));
      return http.get(path, params).then(successFn(opts));
    },

    delete: (location, opts)=> (...args)=>{
      const {path, props:data} = resolveArgs(args, merge({location, props:args[0], convertFn:opts.params}, opts));
      return http.delete(path, data).then(successFn(opts));
    },

    post: (location, opts)=> (...args)=>{
      const {path, props:data} = resolveArgs(args, merge({location, props:args[0], convertFn:opts.data}, opts));
      return http.post(path, data).then(successFn(opts));
    },

    put: (location, opts)=> (...args)=>{
      const {path, props:data} = resolveArgs(args, merge({location, props:args[0], convertFn:opts.data}, opts));
      return http.put(path, data).then(successFn(opts));
    },
  }
}

const buildMethod = (uri, http, config)=>{
  const {verb, ...opts} = config;

  const method = remote(http)[verb];
  if(!method){
    throw `Can not build method of verb: ${verb}`;
  }
  return method(uri, opts);
}

module.exports = buildMethod;
