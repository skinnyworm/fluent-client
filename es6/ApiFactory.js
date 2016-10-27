const createApi = require('./createApi');
const reduceTemplate = require('./reduceTemplate');

module.exports = function ApiFactory(opts){
  const {http, template:baseTemplate} = opts;
  if(!http){
    throw "Must provide a http instance."
  }

  return ({base, template}, reduceFn)=> {
    const initial = template || baseTemplate;
    if (!initial){
      throw "Must define an api template"
    }
    return createApi({http, base, template: reduceTemplate(initial, reduceFn)});
  }
}
