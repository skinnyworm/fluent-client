module.exports = ()=>({
  collection:{
    create: {
      verb: 'post'
    },

    find: {
      args: ['filter'],
      verb: 'get'
    },

    findOne: {
      verb: 'get',
      args: ['filter'],
      path: '/findOne'
    },

    count: {
      verb: 'get',
      args: ['filter'],
      path: '/count'
    }
  },
  
  instance:{
    get: {
      verb: 'get'
    },

    update: {
      verb: 'put'
    },

    destroy: {
      verb: 'delete'
    }
  }
});
