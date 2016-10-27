const Http = ()=>{
  const http = ['get', 'post', 'put', 'delete'].reduce((http, verb)=>{
    http[verb] = jest.fn(()=>Promise.resolve(verb));
    return http;
  }, {})

  http.argsOf = (verb)=>{
    return http[verb].mock.calls[0]
  }
  return http;
}

module.exports = Http;
