jest.unmock('../buildMethod');

describe('buildMethod', ()=>{
  let buildMethod, http

  beforeEach(()=>{
    http = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }
    buildMethod = require('../buildMethod').default;
  });


  describe("build get method", ()=>{
    it("calls http get", ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get'
      });

      get();
      const {calls} = http.get.mock;
      const [path] = calls[0];
      expect(calls.length).toEqual(1);
      expect(path).toEqual('/MyApi');
    });

    it("calls http get with path", ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        path: '/list'
      });

      get();
      const [path] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi/list');
    });

    it("can convert arguments to path element given argument names are defined", ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        path: '/:id/list',
        args: ["id"]
      });

      get(1234);
      const [path, params] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi/1234/list');
      expect(params).not.toBeDefined();
    });

    it('can convert arguments to get params given argument names is defined', ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        args: ['param1', 'param2']
      });

      get("test", "that");
      const [path, args] = http.get.mock.calls[0];
      expect(args).toEqual({param1:'test', param2:'that'});
    });

    it('can convert arguments to get params with customize function', ()=>{
      const get = buildMethod('/MyApi', http, {
        verb: 'get',
        args: ['param1', 'param2'],
        params: ({param1, param2})=>({combined: `${param1}:${param2}`})
      });

      get("test", "that");
      const [path, args] = http.get.mock.calls[0];
      expect(args).toEqual({combined:'test:that'});
    });
  });



  describe("build post method", ()=>{
    it("call http post", ()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post'
      });

      post({name:'test'});

      const {calls} = http.post.mock;
      const [path] = calls[0];
      expect(calls.length).toEqual(1);
      expect(path).toEqual('/MyApi');
    });

    it("call http post with path", ()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        path: '/create'
      });

      post({name:'test'});

      const [path] = http.post.mock.calls[0];
      expect(path).toEqual('/MyApi/create');
    });

    it("call http post with first argument", ()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        path: '/create'
      });

      post({name:'test'});

      const [path, data] = http.post.mock.calls[0];
      expect(path).toEqual('/MyApi/create');
      expect(data).toEqual({name:'test'});
    });

    it("can convert arguments to post data given argument names is defined",()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        args: ["name", "age"]
      });

      post("Smith", 17);

      const [path, data] = http.post.mock.calls[0];
      expect(data).toEqual({name: 'Smith', age: 17});
    });


    it("can convert arguments to post data with customize function",()=>{
      const post = buildMethod('/MyApi', http, {
        verb: 'post',
        args: ["name", "age"],
        data: ({name, age})=>({combied: `${name}:${age}`})
      });

      post("Smith", 17);

      const [path, data] = http.post.mock.calls[0];
      expect(data).toEqual({combied: 'Smith:17'});
    });

  });

  describe("build put method", ()=>{
    it("calls http put", ()=>{
      const put = buildMethod('/MyApi', http, {
        verb: 'put'
      });

      put({});
      const {calls} = http.put.mock;
      const [path] = calls[0];
      expect(calls.length).toEqual(1);
      expect(path).toEqual('/MyApi');
    });
  });

  describe("build destroy method", ()=>{
    it("calls http delete", ()=>{
      const destroy = buildMethod('/MyApi', http, {
        verb: 'delete'
      });

      destroy();
      const {calls} = http.delete.mock;
      const [path] = calls[0];
      expect(calls.length).toEqual(1);
      expect(path).toEqual('/MyApi');
    });
  });

})
