module.exports = (opts={})=>{
  let {ok, data} = opts;
  data = data || JSON.stringify({success:true});
  const fetch = jest.fn(()=>Promise.resolve({
    ok: !!ok,
    json: ()=>Promise.resolve(data)
  }));

  fetch.data = (d)=>{
    data = d;
  }
  return fetch;
}
