import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';

const defaultFetch = fetch;

const jsonEncode = (data)=>{
  return {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data || {})
  }
}

const jsonDecode = (response)=>{
  const contentType = response.headers.get('Content-Type');
  const contentLength = response.headers.get('Content-Length');
  return response.json().catch(err=>({})).then(json=>{
    if (!response.ok) {
      return Promise.reject(json)
    }
    return json;
  })
}

const Http = (opts={})=>{

  const url = opts.url || Http.urlBuilder('http://localhost');
  const headers = opts.headers || Http.headerBuilder();
  const encode = opts.encode || jsonEncode;
  const decode = opts.decode || jsonDecode;
  const fetch = opts.fetch || defaultFetch;

  return {
    get(path, params=null){
      return fetch(url(path, params),{
        method: 'GET',
        headers: headers(),
      }).then(decode);
    },

    post(path, data){
      const {body, headers:contentTypeHeaders} = encode(data);
      let fetchOptions = {
        method: 'POST',
        headers: headers(contentTypeHeaders),
      }

      fetchOptions = merge(fetchOptions, {body: body||{}});
      return fetch(url(path), fetchOptions).then(decode);
    },

    put(path, data){
      const {body, headers:contentTypeHeaders} = encode(data);
      let fetchOptions = {
        method: 'PUT',
        headers: headers(contentTypeHeaders),
      }

      fetchOptions = merge(fetchOptions, {body: body||{}});
      return fetch(url(path), fetchOptions).then(decode);
    },

    delete(path, data){
      const {body, headers:contentTypeHeaders} = encode(data);
      let fetchOptions = {
        method: 'DELETE',
        headers: headers(contentTypeHeaders),
      }

      fetchOptions = merge(fetchOptions);
      return fetch(url(path), fetchOptions).then(decode);
    }
  }
}


Http.urlBuilder = (apiBase, defaultParams={})=>{
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

Http.headerBuilder = (defaultHeaders={})=>{
  return function buildHeaders(headers={}){
    if(typeof(defaultHeaders) === 'function'){
      return merge({}, headers, defaultHeaders());
    }else{
      return merge({}, headers, defaultHeaders)
    }
  }
}

export default Http;
