import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';

export const jsonFormat = {
  encode: (data)=>{
    if(data){
      return {
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      }
    }else{
      return {}
    }
  },

  decode: (response)=>{
    const contentType = response.headers.get('Content-Type');
    const contentLength = response.headers.get('Content-Length');

    if(Number(contentLength) > 0){
      return response.json().then(json => {
        if (!response.ok) {
          return Promise.reject(json)
        }
        return json;
      })
    }else{
      return response.ok ? Promise.resolve(true) : Promise.reject(false);
    }
  }
}

export const urlBuilder = (apiBase, defaultParams={})=>{
  return function buildUrl(path, params={}){
    if(typeof(defaultParams) === 'function'){
      params = merge({}, params, defaultParams());
    }else{
      params = merge({}, params, defaultParams)
    }

    let url = [apiBase, path].join('');
    if(!isEmpty(params)){
      const query = Object.keys(params).map(key=>`${key}=${encodeURIComponent(params[key])}`).join('&');
      url = `${url}?${query}`
    }
    return url;
  }
}

export const headerBuilder = (defaultHeaders={})=>{
  return function buildHeaders(headers={}){
    if(typeof(defaultHeaders) === 'function'){
      return merge({}, headers, defaultHeaders());
    }else{
      return merge({}, headers, defaultHeaders)
    }
  }
}

export default function Http(opts={}){
  let {url: buildUrl, headers: buildHeaders, format} = opts;

  buildUrl = buildUrl || urlBuilder('http://localhost');
  buildHeaders = buildHeaders || headerBuilder();
  format = format || jsonFormat;

  return {
    get(path, params=null){
      return fetch(buildUrl(path, params),{
        method: 'GET',
        headers: buildHeaders(),
      }).then(format.decode);
    },

    post(path, data){
      const {body, headers:contentTypeHeaders} = format.encode(data);
      let fetchOptions = {
        method: 'POST',
        headers: buildHeaders(contentTypeHeaders),
      }
      if(!isEmpty(body)){
        fetchOptions = merge(fetchOptions, {body});
      }
      return fetch(buildUrl(path), fetchOptions).then(format.decode);
    },

    put(path, data){
      const {body, headers:contentTypeHeaders} = format.encode(data);
      let fetchOptions = {
        method: 'PUT',
        headers: buildHeaders(contentTypeHeaders),
      }
      if(!isEmpty(body)){
        fetchOptions = merge(fetchOptions, {body});
      }
      return fetch(buildUrl(path), fetchOptions).then(format.decode);
    },

    delete(path){
      return fetch(buildUrl(path),{
        method: 'DELETE',
        headers: buildHeaders(),
      }).then(format.decode);
    }
  }
}
