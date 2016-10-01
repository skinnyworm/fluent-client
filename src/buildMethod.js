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

  const toPath = ({location, relations, path, restPath, props})=>{
    let pathComponents = [location];
    if(restPath){
      if(props.id){
        pathComponents = [...pathComponents, "/:id"];
      }

      if(relations){
        const relationComponents = relations.map(relation=>{
          const idKey = `${relation}Id`
          return props[idKey] ? `/${relation}/:${idKey}`:`/${relation}`
        });
        pathComponents = [...pathComponents, ...relationComponents]
      }
    }
    if(path){
      pathComponents = [...pathComponents, path];
    }

    return evalPath(pathComponents.join(''), props);
  }

  const resolveArgs = (args, opts)=>{
    let {args:argNames, location:loc, path, convertFn, props, restPath} =  opts;
    const {location, relations, ...ids} = loc;

    // named arguments
    if(argNames){
      props = namedArgs(argNames, args);
    }

    // merge location ids with props
    props = merge({}, props, ids);

    // need to convert props with customize function
    if(convertFn){
      props = convertFn(props)
    }

    return toPath({location, relations, path, props, restPath});
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
