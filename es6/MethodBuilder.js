import merge from 'lodash/merge';

/**
 * reduce function to initialize props
 */
function argsToProps(memo, opts){
  const {args, argNames} = opts;
  const props = !argNames ? args[0] : argNames.reduce((memo, name, i)=>{
    return args[i] ? Object.assign(memo, {[name]:args[i]}) : memo;
  },{});
  return Object.assign(memo, {props: props || {}})
}


/**
 * reduce function to build path template from location
 */
function buildRestPathTemplate(memo, opts){
  const {base, path, relations, ...ids} = opts.location
  let {props} = memo;
  // make path from base
  let pathComponents = [base];
  // make rest path with id and relations
  if(ids.id){
    pathComponents = [...pathComponents, "/:id"];
  }
  // merge relations and ids
  if(relations){
    const relationComponents = relations.map(relation=>{
      const idKey = `${relation}Id`
      return ids[idKey] ? `/${relation}/:${idKey}`:`/${relation}`
    });
    pathComponents = [...pathComponents, ...relationComponents]
  }
  //append path component
  if(path){
    pathComponents = [...pathComponents, path];
  }


  // merge ids with props for path template
  props = Object.assign(props, ids);
  return Object.assign(memo, {props, pathTemplate: pathComponents.join('')});
}


/**
 * reduce function to resolve restful path from pathTemplate and props
 */
function resolvePath(memo, opts){
  const {convertFn} = opts;
  let {props, pathTemplate} = memo;

  // convert props if necessary

  if(convertFn){
    props = convertFn(props)
  }

  // process pathTemplate
  const path = pathTemplate.replace(/\/:[^\/]*/g, (s)=>{
    const name = s.substr(2);
    const value = props[name];
    if(value){
      delete(props[name]);
      return `/${value}`
    }else{
      return s;
    }
  });
  return Object.assign(memo, {path, props});
}



module.exports = (buildConfig={})=> (location, http, config)=>{
  const buildPathTemplate = config.buildPathTemplate || buildRestPathTemplate;
  const {verb, success, base, path, args: argNames} = config;
  const convertFn = config.params || config.data;
  const method = http[verb];
  if(!method){
    throw `Can not build method of verb: ${verb}`;
  }

  return (...args)=>{
    const opts = {location: merge({}, location, {base, path}), args, convertFn, argNames}
    const {path:uri, props} = [argsToProps, buildPathTemplate, resolvePath].reduce((memo, fn)=>fn(memo, opts), {});


    return method(uri, props).then((response)=>{
      return !!success ? success(response) : response
    });
  }
}
