jest.disableAutomock();

const reduceTemplate = require('../reduceTemplate');

describe('reduceTemplate', ()=>{

  it('will return initial given reduceFn is not provided', ()=>{
    const initial = {
      collection:{}
    }

    const template = reduceTemplate(initial);
    expect(template).toBe(initial);
  });

  it('can reduce instance methods', ()=>{
    const initial = {
      instance:{
        other: 'value'
      }
    };
    const example = {
      instance:{
        other: 'value',
        instanceMethod: 'instance value'
      }
    }

    const template = reduceTemplate(initial, (reducers)=>{
      reducers.instance({
        instanceMethod: "instance value"
      })
    });
    expect(template).not.toBe(initial);
    expect(template).toEqual(example);
  });

  it('can reduce collection methods', ()=>{
    const initial = {
      collection: {
        other: 'value',
      }
    };
    const example = {
      collection:{
        other: 'value',
        collectionMethod: 'collection method'
      }
    }

    const template = reduceTemplate(initial, (reducers)=>{
      reducers.collection({
        collectionMethod: 'collection method'
      })
    });
    expect(template).not.toBe(initial);
    expect(template).toEqual(example);
  });

  describe('reduce relation', ()=>{
    it('can reduce many template', ()=>{
      const initial = {
        relations:{
          many:{
            books:{
              collection:{
                create: 'create'
              }
            }
          }
        }
      };

      const example = {
        relations:{
          many:{
            books:{
              collection:{
                create: 'create'
              }
            },
            projects:{
              collection:{
                create: 'create'
              }
            }
          }
        }
      };

      const template = reduceTemplate(initial, (reducers)=>{
        reducers.relation({type:'many', name:'projects'}, (reducers)=>{
          reducers.collection({
            create: 'create'
          })
        })
      });

      expect(template).not.toBe(initial);
      expect(template).toEqual(example);
    });

    it('can reduce one template', ()=>{
      const initial = {
        relations:{
          one:{
            profile:{
              collection:{
                get: 'get'
              }
            }
          }
        }
      };

      const example = {
        relations:{
          one:{
            profile:{
              collection:{
                get: 'get'
              }
            },
            token:{
              collection:{
                refresh: 'refresh'
              }
            }
          }
        }
      };

      const template = reduceTemplate(initial, (reducers)=>{
        reducers.relation({type:'one', name:'token'}, (reducers)=>{
          reducers.collection({
            refresh: 'refresh'
          })
        })
      });

      expect(template).not.toBe(initial);
      expect(template).toEqual(example);
    });

  })



})
