const MockHttp = require('../__mocks__/MockHttp');
const buildMethod = require('../buildMethod');

describe('buildMethod', ()=>{
  let http;

  beforeEach(()=>{
    http = MockHttp();
  });


  describe("build get method", ()=>{
    it("calls http get", ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get'
      });

      get();

      expect(http.argsOf('get')).toEqual(['/MyApi', undefined]);
    });

    it("calls http get with path", ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        path: '/list'
      });

      get();

      expect(http.argsOf('get')).toEqual(['/MyApi/list', undefined]);
    });

    it("can convert arguments to path element given argument names are defined", ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        path: '/:id/list',
        args: ["id"]
      });

      get(1234);

      expect(http.argsOf('get')).toEqual(['/MyApi/1234/list', undefined]);
    });

    it('can convert arguments to get params given argument names is defined', ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        args: ['param1', 'param2']
      });

      get("test", "that");

      expect(http.argsOf('get')).toEqual(['/MyApi', {param1:'test', param2:'that'}]);
    });

    it('can convert arguments to get params with customize function', ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        args: ['param1', 'param2'],
        params: ({param1, param2})=>({combined: `${param1}:${param2}`})
      });

      get("test", "that");

      expect(http.argsOf('get')).toEqual(['/MyApi', {combined:'test:that'}]);
    });

    it('can invoke success handler once request is done successfully', ()=>{
      const success = jest.fn();
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        success
      });

      return get().then(()=>{
        expect(success.mock.calls.length).toBe(1);
      });

    });
  });



  describe("build post method", ()=>{
    it("call http post", ()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post'
      });

      post({name:'test'});

      expect(http.argsOf('post')).toEqual(['/MyApi', {name:'test'}]);
    });

    it("call http post with path and data", ()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        path: '/create'
      });

      post({name:'test'});

      expect(http.argsOf('post')).toEqual(['/MyApi/create', {name:'test'}]);
    });

    it("can convert arguments to post data given argument names is defined",()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        args: ["name", "age"]
      });

      post("Smith", 17);

      expect(http.argsOf('post')).toEqual(['/MyApi', {name: 'Smith', age: 17}]);
    });


    it("can convert arguments to post data with customize function",()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        args: ["name", "age"],
        data: ({name, age})=>({combied: `${name}:${age}`})
      });

      post("Smith", 17);

      expect(http.argsOf('post')).toEqual(['/MyApi', {combied: 'Smith:17'}]);
    });

  });

  describe("build put method", ()=>{
    it("calls http put", ()=>{
      const put = buildMethod('/MyApi', http, {
        verb: 'put'
      });

      put({});

      expect(http.argsOf('put')).toEqual(['/MyApi', {}]);
    });
  });

  describe("build destroy method", ()=>{
    it("calls http delete", ()=>{
      const destroy = buildMethod('/MyApi', http, {
        verb: 'delete'
      });

      destroy();
      
      expect(http.argsOf('delete')).toEqual(['/MyApi', undefined]);
    });
  });

})
