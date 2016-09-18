const reduceTemplate = require('./reduceTemplate');
const Http = require('./Http');
const Url = require('./Url');
const Api = require('./Api');

const FluentClient = (opts = {})=>{
  let {template:_template, http:_http, ...httpCfg} = opts;
  const http = _http || Http(httpCfg)
  const api = {http}
  const define = (name, {location, template}, reduceFn)=>{
    let initial = template || _template;
    if (!initial){
      throw "Must define an api template"
    }
    api[name] = Api({location, http, template:reduceTemplate(initial, reduceFn)});
    return api;
  }

  return Object.assign(api, {define});
}

module.exports = {
  FluentClient,
  Http,
  Url
}
