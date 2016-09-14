const isEmpty = require('lodash/isEmpty');
const defaultUrlBuilder = (params)=>Promise.resolve(params);


module.exports = function Url(apiBase, paramsBuilder){
  paramsBuilder = paramsBuilder || defaultUrlBuilder;

  return (path, params)=>{
    let url = [apiBase, path].join('');
    return paramsBuilder(params)
    .then(params=>{
      if(!isEmpty(params)){
        const query = Object.keys(params).map(key=>`${key}=${encodeURIComponent(params[key])}`).join('&');
        url = `${url}?${query}`
      }
      return url;
    });
  }
}
