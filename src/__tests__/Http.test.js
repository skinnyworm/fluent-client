jest.unmock('../Http')
import Http, {urlBuilder, headerBuilder, jsonFormat} from '../Http';


xdescribe('Http', ()=>{
  let fetch;

  beforeEach(()=>{
    fetch = jest.fn();
    global.fetch = fetch;
    fetch.mockReturnValue(Promise.resolve({
      headers:{
        get(key){
          return {
            'Content-Type': 'application/json',
            'Content-Length': 160,
          }[key];
        }
      },
      ok: true,
      json: ()=>Promise.resolve({result: "data"})
    }));
  })

  afterEach(()=>{
    delete global.fetch
  })

  describe('urlBuilder', ()=>{
    let http;

    beforeEach(()=>{
      const url = Http.urlBuilder('http://example.com');
      http = Http({url});
    });

    it('build url with api base', ()=>{
      http.get('/Users');
      const [url, options] = fetch.mock.calls[0];
      expect(url).toEqual('http://example.com/Users');
    });

    it('build url with encoded params', ()=>{
      http.get('/Users',{id:1234});
      const [url, options] = fetch.mock.calls[0];
      expect(url).toEqual('http://example.com/Users?id=1234');
    });

    it('can add default params to the url', ()=>{
      http = Http({url: Http.urlBuilder('http://example.com', {always:true})});
      http.get('/Users');
      const [url, options] = fetch.mock.calls[0];
      expect(url).toEqual('http://example.com/Users?always=true');
    });

    it('can add default params as a function', ()=>{
      http = Http({url: Http.urlBuilder('http://example.com', ()=>({access_token: '1234'}))});
      http.get('/Users');
      const [url, options] = fetch.mock.calls[0];
      expect(url).toEqual('http://example.com/Users?access_token=1234');
    });
  });

  describe('headerBuilder', ()=>{
    let http;

    beforeEach(()=>{
      const url = Http.urlBuilder('http://example.com');
      const headers = Http.headerBuilder({sessionToken:'1234'});
      http = Http({url, headers});
    });

    it('add default headers to the request', ()=>{
      http.get('/Users');
      const [url, options] = fetch.mock.calls[0];
      const {headers} = options;
      expect(headers).toEqual({sessionToken:'1234'});
    });

    it('merge request headers with default headers', ()=>{
      http.post('/Users', {name: 'people'});
      const [url, options] = fetch.mock.calls[0];
      const {headers} = options;
      expect(headers).toEqual({sessionToken:'1234', 'Content-Type':'application/json'});
    })

    it('default headers can be a function', ()=>{
      http = Http({url: Http.urlBuilder('http://example.com'), headers: Http.headerBuilder(()=>({sessionToken:'1234'}))});

      http.get('/Users');
      const [url, options] = fetch.mock.calls[0];
      const {headers} = options;
      expect(headers).toEqual({sessionToken:'1234'});
    });
  })


  pit('handles GET request', ()=>{
    return Http().get('/test').then(result=>{
      expect(result).toBeDefined();
      const [url, options] = fetch.mock.calls[0];
      const {method, body, headers} = options;

      expect(method).toEqual('GET');
      // expect(body).not.toBeDefined();
      expect(Object.keys(headers).length).toBe(0);
    });
  })

  pit('handles PUT request with body', ()=>{
    return Http().put('/test',{data: 1}).then(result=>{
      expect(result).toBeDefined();
      const [url, options] = fetch.mock.calls[0];
      const {method, body, headers} = options;

      expect(method).toEqual('PUT');
      expect(body).toBeDefined();
      expect(headers).toEqual({'Content-Type':'application/json'})
    });
  })

  pit('handles POST request with body', ()=>{
    return Http().post('/test', {data:1}).then(result=>{
      expect(result).toBeDefined();
      const [url, options] = fetch.mock.calls[0];
      const {method, body, headers} = options;

      expect(method).toEqual('POST');
      expect(body).toBeDefined();
      expect(headers).toEqual({'Content-Type':'application/json'})
    });
  })

  pit('handles POST/PUT request without body', ()=>{
    return Http().post('/test').then(result=>{
      expect(result).toBeDefined();
      const [url, options] = fetch.mock.calls[0];
      const {method, body, headers} = options;

      expect(method).toEqual('POST');
      expect(body).toEqual(JSON.stringify({}));
      expect(Object.keys(headers).length).toBe(1);
    })

  })

  pit('handles DELETE request', ()=>{
    return Http().delete('/test/123').then(result=>{
      expect(result).toBeDefined();
      const [url, options] = fetch.mock.calls[0];
      const {method, body, headers} = options;

      expect(method).toEqual('DELETE');
      expect(body).not.toBeDefined();
      expect(Object.keys(headers).length).toBe(1);
    });
  })

})
