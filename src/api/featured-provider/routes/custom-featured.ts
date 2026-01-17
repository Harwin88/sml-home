export default {
  routes: [
    {
      method: 'GET',
      path: '/featured-providers/active',
      handler: 'featured-provider.findActive',
      config: {
        auth: false, // Permitir acceso público, pero también funciona con Bearer token
        policies: [],
        middlewares: [],
      },
    },
  ],
};

