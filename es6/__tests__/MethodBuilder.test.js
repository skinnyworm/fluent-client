const MockHttp = require('../__mocks__/MockHttp');
const MethodBuilder = require('../MethodBuilder');

describe('buildMethod', ()=>{
  let http, buildMethod;

  beforeEach(()=>{
    http = MockHttp();
    buildMethod = MethodBuilder();
  });

  describe('http verbs',()=>{
    it('calls http get', ()=>{
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get'
      });

      get();
      expect(http.argsOf('get')).toEqual(['/MyApi', {}]);
    });

    it('calls http post', ()=>{
      const post = buildMethod({base:'/MyApi'}, http, {
        verb: 'post'
      });

      post({name:'test'});
      expect(http.argsOf('post')).toEqual(['/MyApi', {name:'test'}]);
    });

    it('calls http put', ()=>{
      const put = buildMethod({base:'/MyApi'}, http, {
        verb: 'put'
      });

      put({});
      expect(http.argsOf('put')).toEqual(['/MyApi', {}]);
    });

    it('calls http delete', ()=>{
      const destroy = buildMethod({base:'/MyApi'}, http, {
        verb: 'delete'
      });

      destroy();
      expect(http.argsOf('delete')).toEqual(['/MyApi', {}]);
    });

    it('calls http post with path and data', ()=>{
      const post = buildMethod({base:'/MyApi'}, http, {
        verb: 'post',
        path: '/create'
      });

      post({name:'test'});
      expect(http.argsOf('post')).toEqual(['/MyApi/create', {name:'test'}]);
    });
  })

  describe('convert arguments', ()=>{
    it('use method argument as params given no argNames is provided', ()=>{
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get',
      });

      get({id:1234});
      expect(http.argsOf('get')).toEqual(['/MyApi', {id:1234}]);
    })

    it('can convert arguments to path element', ()=>{
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get',
        path: '/:id/list',
        args: ['id']
      });

      get(1234);

      expect(http.argsOf('get')).toEqual(['/MyApi/1234/list', {}]);
    });

    it('can convert arguments to get params', ()=>{
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get',
        args: ['param1', 'param2']
      });

      get('test', 'that');

      expect(http.argsOf('get')).toEqual(['/MyApi', {param1:'test', param2:'that'}]);
    });

    it('can convert arguments to get params with customize function', ()=>{
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get',
        args: ['param1', 'param2'],
        params: ({param1, param2})=>({combined: `${param1}:${param2}`})
      });

      get('test', 'that');

      expect(http.argsOf('get')).toEqual(['/MyApi', {combined:'test:that'}]);
    });

    it('can convert arguments to post data',()=>{
      const post = buildMethod({base:'/MyApi'}, http, {
        verb: 'post',
        args: ['name', 'age']
      });

      post('Smith', 17);

      expect(http.argsOf('post')).toEqual(['/MyApi', {name: 'Smith', age: 17}]);
    });


    it('can convert arguments to post data with customize function',()=>{
      const post = buildMethod({base:'/MyApi'}, http, {
        verb: 'post',
        args: ['name', 'age'],
        data: ({name, age})=>({combined: `${name}:${age}`})
      });

      post('Smith', 17);

      expect(http.argsOf('post')).toEqual(['/MyApi', {combined: 'Smith:17'}]);
    });
  })

  describe('append path', ()=>{
    it('add path to base', ()=>{
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get',
        path: '/list'
      });

      get();

      expect(http.argsOf('get')).toEqual(['/MyApi/list', {}]);
    });
  })

  describe('invoke success', ()=>{
    it('can invoke success handler once request is done successfully', ()=>{
      const success = jest.fn();
      const get = buildMethod({base:'/MyApi'}, http, {
        verb: 'get',
        success
      });

      return get().then(()=>{
        expect(success.mock.calls.length).toBe(1);
      });
    });
  });

  describe('resfult path', ()=>{
    it("build restful path based on location's id", ()=>{
      const location={base:'/Post', id:"1234"}
      const get = buildMethod(location, http, {verb: 'get'});
      get();
      expect(http.argsOf('get')).toEqual(['/Post/1234', {}]);
    })

    it('build resfult path for related collection', ()=>{
      const location={base:'/Post', id:"1234", relations:["comments"]}
      const get = buildMethod(location, http, {verb: 'get'});
      get();
      expect(http.argsOf('get')).toEqual(['/Post/1234/comments', {}]);
    })

    it('build resfult path for related instance', ()=>{
      const location={base:'/Post', id:"1234", relations:["comments"], commentsId:"4567"}
      const get = buildMethod(location, http, {verb: 'get'});
      get();
      expect(http.argsOf('get')).toEqual(['/Post/1234/comments/4567', {}]);
    })

    it('build resfult path for related instance with params in path', ()=>{
      const location={base:'/Post', id:"1234", relations:["comments"], commentsId:"4567"}
      const get = buildMethod(location, http, {
        verb: 'get',
        path: '/list/:style',
        args: ['style'],
      });

      get("red");
      expect(http.argsOf('get')).toEqual(['/Post/1234/comments/4567/list/red', {}]);
    })
  })
})
