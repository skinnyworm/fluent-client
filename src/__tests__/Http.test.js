const MockFetch = require('../__mocks__/MockFetch');
const Http = require('../Http');
const Url = require('../Url');

describe('Http', ()=>{
  let http, url, fetch;

  beforeEach(()=>{
    fetch = MockFetch({ok:true});
    url = Url('http://example.com');
    http = Http({fetch, url});
  });

  it("has 'get', 'delete', 'post' and 'put' methods", ()=>{
    expect(http.get).toBeDefined();
    expect(http.delete).toBeDefined();
    expect(http.post).toBeDefined();
    expect(http.put).toBeDefined();
  });

  pit('resolve url before fetch', async ()=>{
    await http.get('/users');

    const [fetchUrl, fetchData] = fetch.mock.calls[0];
    expect(fetchUrl).toEqual('http://example.com/users');
  })

  pit('resolve fetch config before fecth', async ()=>{
    const init = jest.fn(()=>Promise.resolve({
      headers:{
        'x-extra': 'extra header'
      }
    }));
    http = Http({fetch, url, init});

    await http.get('/users');

    expect(init.mock.calls.length).toEqual(1);
    const [fetchUrl, fetchData] = fetch.mock.calls[0];
    expect(fetchData).toEqual({
      method: 'GET',
      headers: {
        'x-extra': 'extra header'
      }
    });
  })

  pit('encode request body by using default json encoder when put and post', async ()=>{
    const data = {username:'username', password:'password'}
    await http.post('/user/login', data);

    const [fetchUrl, fetchData] = fetch.mock.calls[0];

    expect(fetchUrl).toEqual('http://example.com/user/login');
    expect(fetchData).toEqual({
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

  })

  pit('decode response body by using default json decoder', async ()=>{
    fetch.data({name:'Tom'});
    const result = await http.get('/user');

    expect(result).toEqual({name:'Tom'});
  })
});
