jest.unmock('../templates');
jest.unmock('../buildMethod');
jest.unmock('../FluentClient');

describe('FluentClient', ()=>{
  let api, http;

  beforeEach(()=>{
    http = require('../Http').default();
    api = require('../FluentClient').default({http});
  })

  describe('Default RestfulModel', ()=>{
    let MyApi;

    beforeEach(()=>{
      MyApi = api({path:"/MyApi"});
    });

    it('can create', ()=>{
      const obj = {name:'test'};
      expect(typeof(MyApi.create)).toBe('function');

      MyApi.create(obj);

      const [path, data] = http.post.mock.calls[0];
      expect(path).toEqual('/MyApi');
      expect(data).toEqual(obj);
    });

    it('can find', ()=>{
      const filter = {sort: 'desc'};
      expect(typeof(MyApi.find)).toBe('function');

      MyApi.find(filter);

      const [path, params] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi');
      expect(params).toEqual({filter:{sort:'desc'}});
    });

    it('can findOne', ()=>{
      const filter = {sort: 'desc'};
      expect(typeof(MyApi.findOne)).toBe('function');

      MyApi.findOne(filter);

      const [path, params] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi/findOne');
      expect(params).toEqual({filter:{sort:'desc'}});
    });

    it('can count', ()=>{
      const filter = {sort: 'desc'};
      expect(typeof(MyApi.count)).toBe('function');

      MyApi.count(filter);

      const [path, params] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi/count');
      expect(params).toEqual({filter:{sort:'desc'}});
    });

    it('can get instance', ()=>{
      expect(typeof(MyApi(123).get)).toBe('function');

      MyApi(123).get();

      const [path, params] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi/123');
      expect(params).toBe(null);
    });

    it('can destroy instance', ()=>{
      expect(typeof(MyApi(123).destroy)).toBe('function');

      MyApi(123).destroy();

      const [path] = http.delete.mock.calls[0];
      expect(path).toEqual('/MyApi/123');
    });

    it('can update instance', ()=>{
      const updateData = {name:'test'};
      expect(typeof(MyApi(123).update)).toBe('function');

      MyApi(123).update(updateData);

      const [path, data] = http.put.mock.calls[0];
      expect(path).toEqual('/MyApi/123');
      expect(data).toEqual(updateData);
    });
  });

  describe('extend model', ()=>{
    it('can add collection methods', ()=>{
      const MyApi = api({path:"/MyApi"}, api=>{
        api.collection({
          list:{
            verb: 'get',
            path: '/list'
          }
        });
      });

      expect(typeof(MyApi.list)).toBe('function');
      expect(typeof(MyApi.find)).toBe('function');

      MyApi.list();
      const [path, params] = http.get.mock.calls[0];
      expect(path).toEqual('/MyApi/list');
    });


    it('can add instance methods', ()=>{
      const MyApi = api({path:"/MyApi"}, api=>{
        api.instance({
          join:{
            verb: 'post',
            path: '/join'
          }
        });
      });

      expect(typeof(MyApi('123').join)).toBe('function');
      expect(typeof(MyApi('123').update)).toBe('function');

      MyApi('123').join({data:'data'});

      const [path, data] = http.post.mock.calls[0];
      expect(path).toEqual('/MyApi/123/join');
      expect(data).toEqual({data:'data'});
    });
  });

  describe('add relations', ()=>{
    it('can add one relation', ()=>{
      const MyApi = api({path:"/MyApi"}, api=>{
        api.relation({type:'one', name:'owner'}, (rel)=>{
          rel.instance({
            get:{
              verb: 'get'
            },
            set:{
              verb: 'post',
              args: ['userId'],
              data: ({userId})=>({userId})
            }
          });
        });
      });


      expect(MyApi('123').owner).toBeDefined();
      expect(typeof(MyApi('123').owner.get)).toBe('function');
      expect(typeof(MyApi('123').owner.set)).toBe('function');

      MyApi('123').owner.get()
      MyApi('123').owner.set("4567")

      let [getPath] = http.get.mock.calls[0];
      expect(getPath).toEqual('/MyApi/123/owner');

      let [postPath, data] = http.post.mock.calls[0];
      expect(postPath).toEqual('/MyApi/123/owner');
      expect(data).toEqual({userId: '4567'});
    });

    it('can add many relation', ()=>{
      const MyApi = api({path:"/MyApi"}, api=>{
        api.relation({type:'many', name:'items'}, (rel)=>{
          rel.collection({
            list:{
              verb: 'get',
              path: '/list'
            }
          });

          rel.instance({
            join:{
              args: ['userId'],
              verb: 'post',
              path: '/join',
              data: ({userId}) => ({userId})
            }
          });
        });
      });

      expect(MyApi('123').items).toBeDefined();
      expect(MyApi('123').items.list).toBeDefined();
      expect(MyApi('123').items('456').join).toBeDefined();

      MyApi('123').items.list()
      MyApi('123').items('456').join("userId")

      let [getPath] = http.get.mock.calls[0];
      expect(getPath).toEqual('/MyApi/123/items/list');

      let [postPath, data] = http.post.mock.calls[0];
      expect(postPath).toEqual('/MyApi/123/items/456/join');
      expect(data).toEqual({userId: 'userId'});
    })
  });
})
