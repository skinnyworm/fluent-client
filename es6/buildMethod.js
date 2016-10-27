import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';

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


/**
 * opts cal include following fields
 * - args -> mapping args from index to named props
 * - base -> uri base path to be override on location
 * - path -> uri path to be set on location
 * - location -> location object
 * - params -> alias to convertFn to convert props to actual request data
 * - data -> alias to convertFn to convert props to actual request data
 * - restPath -> flag to indicate if need to construct rest path
 *
 */
const resolveArgs = (args, opts)=>{
  // args
  let props;
  if(opts.args){
    props = namedArgs(opts.args, args);
  }else{
    props = args[0];
  }

  // merge location ids with props
  const location = merge({}, opts.location, {base: opts.base, path: opts.path});
  const {base, path, relations, ...ids} = location
  props = merge({}, props, ids);

  // need to convert props with customize function
  let convertFn = opts.params || opts.data;
  if(convertFn){
    props = convertFn(props)
  }

  // make path from base
  let pathComponents = [base];

  // make rest path with id and relations
  if(opts.restPath){
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

  // append path to the end of location.
  if(path){
    pathComponents = [...pathComponents, path];
  }

  return evalPath(pathComponents.join(''), props);
}





module.exports = (location, http, config)=>{
  const {verb, success, ...others} = config;
  const opts = merge({location}, others);

  const method = http[verb];
  if(!method){
    throw `Can not build method of verb: ${verb}`;
  }

  return (...args)=>{
    const {path, props} = resolveArgs(args, opts);
    return method(path, props).then((response)=>{
      return !!success ? success(response) : response
    });
  }
}
