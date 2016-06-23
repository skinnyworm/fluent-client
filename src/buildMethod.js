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

  const successFn = ({success})=>{
    return !!success ? success : (result)=>result;
  }


  return{
    get: (base, opts)=>(...args)=>{
      const {path, props:params} = resolveArgs(args, merge(opts, {base, props:null, convertFn:opts.params}));
      return http.get(path, params).then(successFn(opts));
    },

    post: (base, opts)=>(...args)=>{
      const {path, props:data} = resolveArgs(args, merge(opts, {base, props:args[0], convertFn:opts.data}));
      return http.post(path, data).then(successFn(opts));
    },

    put: (base, opts)=>(...args)=>{
      const {path, props:data} = resolveArgs(args, merge(opts, {base, props:args[0], convertFn:opts.data}));
      return http.put(path, data).then(successFn(opts));
    },

    delete: (base, opts)=>(...args)=>{
      const {path, props:data} = resolveArgs(args, merge(opts, {base, props:args[0], convertFn:opts.data}));
      return http.delete(path, data).then(successFn(opts));
    }
  }
}


export default function buildMethod(uri, http, config){
  const {verb, ...opts} = config;
  const method = remote(http)[verb];
  return method(uri, opts);
}
