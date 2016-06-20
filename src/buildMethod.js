import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';

const remote = (http)=>{

  const namedArgs = (argNames, args)=>{
    return argNames.reduce((memo, name, i)=>{
      memo[name] = args[i];
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
    var {args:argNames, base, path, convertFn, props} =  opts;

    if(!argNames){
      return {path:[base, path].join(''), props}
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

      return {path:[base, path].join(''), props};
    }
  }


  return{
    get: (base, opts)=>(...args)=>{
      const {path, props:params} = resolveArgs(args, merge(opts, {base, props:null, convertFn:opts.params}));
      return http.get(path, params);
    },

    post: (base, opts)=>(...args)=>{
      const {path, props:data} = resolveArgs(args, merge(opts, {base, props:args[0], convertFn:opts.data}));
      return http.post(path, data);
    },

    put: (base, opts)=>(...args)=>{
      const {path, props:data} = resolveArgs(args, merge(opts, {base, props:args[0], convertFn:opts.data}));
      return http.put(path, data);
    },

    delete: (base, opts)=>(...args)=>{
      const {path} = resolveArgs(args, merge(opts, {base}));
      return http.delete(path);
    }
  }
}


export default function buildMethod(uri, http, config){
  const {verb, ...opts} = config;
  const method = remote(http)[verb];
  return method(uri, opts);
}
