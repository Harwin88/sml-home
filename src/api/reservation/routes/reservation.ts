export default {
  routes: [
    {
      method: 'GET',
      path: '/reservations',
      handler: 'reservation.find',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/reservations/:id',
      handler: 'reservation.findOne',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/reservations',
      handler: 'reservation.create',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/reservations/:id',
      handler: 'reservation.update',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/reservations/:id',
      handler: 'reservation.delete',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};

