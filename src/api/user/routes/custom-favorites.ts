export default {
  routes: [
    {
      method: 'POST',
      path: '/users/favorites/:providerId',
      handler: 'user.addFavorite',
      config: {
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/users/favorites/:providerId',
      handler: 'user.removeFavorite',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/users/:documentId/favorites',
      handler: 'user.getFavoritesByDocumentId',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/users/favorites',
      handler: 'user.getFavorites',
      config: {
        auth: false
      }
    }
  ]
};

