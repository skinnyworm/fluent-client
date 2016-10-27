describe('ApiFactory', ()=>{
  let factory;

  beforeEach(()=>{
    const ApiFactory = require('../ApiFactory');
    factory = ApiFactory({http:{}, template:{}});
  })

  it('should be defined', ()=>{
    expect(factory).toBeDefined();
  })
})
