export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'user.register',
      config: {
        auth: false, // Público - no requiere autenticación
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'user.login',
      config: {
        auth: false, // Público - no requiere autenticación
        policies: [],
        middlewares: []
      }
    }
  ]
};

