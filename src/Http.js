const merge = require('lodash/merge');

const jsonDecode = (response)=> {
  return response.json()
    .then(json=>{
      if (!response.ok) {
        return Promise.reject(json)
      }
      return json;
    });
}

const jsonEncode = (data)=>{
  const body = JSON.stringify(data)||''
  return {
    headers: {'Content-Type': 'application/json'},
    body: body,
  }
}

/**
 * @param fetch:function  - fetch implementation
 * @param url - A function to resolve url (path:String, params:Object):String
 * @param encode - A function to encode request body from object
 * @param decode - A function to decode response body to object
 * @param init - A function to resolve init options for fetch request
 */
function Http({fetch, url, encode, decode, init}){
  encode = encode || jsonEncode;
  decode = decode || jsonDecode;

  function resolve(path, params){
    return Promise.all([url(path, params), init && init()])
  }

  const requestWithParams = (method)=> (path, params)=> {
    return resolve(path, params)
      .then(([url, config])=>fetch(url, merge({}, config, {method})))
      .then((response)=>decode(response))
  }

  const requestWithBody = (method)=> (path, data)=> {
    return resolve(path)
      .then(([url, config])=> fetch(url, merge({}, config, encode(data), {method})))
      .then((response)=>decode(response))
  }

  return {
    get: requestWithParams('GET'),
    delete: requestWithParams('DELETE'),
    post: requestWithBody('POST'),
    put: requestWithBody('PUT')
  }
}

module.exports = Http;
