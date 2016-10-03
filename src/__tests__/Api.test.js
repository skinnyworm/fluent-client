const MockHttp = require('../__mocks__/MockHttp');
const Api = require('../Api');

describe('Api', ()=>{
  let User, http;

  beforeEach(()=>{
    http = MockHttp();
    User = Api({base:'/user', http, template});
  })

  pit("build collection method such as 'User.create(data)'", async ()=>{

    // const User = Api({base:'/user', http, template:{
    //   collection:{
    //     create:{
    //       verb: 'post'
    //     }
    //   }
    // }});

    const user = {name:'name'}

    expect(User.create).toBeDefined();

    await User.create(user);
    expect(http.argsOf('post')).toEqual(['/user', user]);
  });

  pit("build instance method such as 'User(1).get()'", async ()=>{
    expect(User(1).get).toBeDefined();

    await User(1).get();
    expect(http.argsOf('get')).toEqual(['/user/1', {}]);
  });

  pit("build instance method of one relation such as 'User(1).profile.get()'", async ()=>{
    expect(User(1).profile.get).toBeDefined();

    await User(1).profile.get();
    expect(http.argsOf('get')).toEqual(['/user/1/profile', {}]);
  });

  pit("build collection method of many relation such as 'User(1).projects.create()'", async ()=>{
    const project={name:'project'};
    expect(User(1).projects.create).toBeDefined();

    await User(1).projects.create(project);
    expect(http.argsOf('post')).toEqual(['/user/1/projects', project]);
  });

  pit("build instance method of many relation such as 'User(1).projects(2).get()'", async ()=>{
    expect(User(1).projects(2).get).toBeDefined();

    await User(1).projects(2).get();
    expect(http.argsOf('get')).toEqual(['/user/1/projects/2', {}]);
  });

});


const template = {
  restPath: true,

  // Build collection method such as User.create(data)
  collection:{
    create:{
      verb: 'post'
    }
  },

  // Build instance method such as User(1).get()
  instance:{
    get:{
      verb: 'get'
    }
  },


  relations:{
    // one relation
    one:{
      profile:{
        // Build one releation method such as User(1).profile.get()
        instance:{
          get:{
            verb: 'get',
          }
        }
      }
    },

    many:{
      projects:{
        // Build many relation's collection method such as User(1).projets.create(data);
        collection:{
          create:{
            verb: 'post'
          }
        },
        // Build many relation's instance method such as User(1).projets(2).get();
        instance:{
          get:{
            verb: 'get'
          }
        }
      }
    }
  }
}
