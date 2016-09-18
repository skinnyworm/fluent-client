const MockFetch = require('../__mocks__/MockFetch');
const {FluentClient} = require('../index');
const Url = require('../Url');
const restfulTemplate = require('../restfulTemplate');


describe('FluentClient', ()=>{
  let fluentClient, fetch, url;

  beforeEach(()=>{
    fetch = MockFetch({ok:true});
    url = Url('http://example.com');
    fluentClient = FluentClient({fetch, url, template:restfulTemplate});
  })

  it('has define method and http instance',()=>{
    expect(fluentClient.http).toBeDefined();
    expect(fluentClient.define).toBeDefined();
  });

  pit('can define an api resource', async ()=>{
    fluentClient.define('User', {location:'/users'}, (user)=>{
      user.collection({
        login: {
          verb: 'post',
          path: '/login',
          args: ['username', 'password']
        }
      });
    });

    expect(fluentClient.User).toBeDefined();
    await fluentClient.User.login('username', 'password');

    const [fetchUrl, fetchData] = fetch.mock.calls[0];
    expect(fetchUrl).toEqual('http://example.com/users/login');
    expect(fetchData).toEqual({
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: 'username', password:'password'})
    })
  });

  describe('optional restfulTemplate', ()=>{
    it('has standard restful crud methods', ()=>{
      fluentClient.define('Post', {location:'/projects'})

      expect(fluentClient.Post).toBeDefined();
      expect(fluentClient.Post.find).toBeDefined();
      expect(fluentClient.Post.findOne).toBeDefined();
      expect(fluentClient.Post.create).toBeDefined();
      expect(fluentClient.Post.count).toBeDefined();
      expect(fluentClient.Post(1).get).toBeDefined();
      expect(fluentClient.Post(1).update).toBeDefined();
      expect(fluentClient.Post(1).destroy).toBeDefined();
    });
  });
})
