/**
 * Custom routes para newsletter-subscription
 * Rutas públicas para suscripción y cancelación
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/newsletter-subscriptions/subscribe',
      handler: 'newsletter-subscription.subscribe',
      config: {
        auth: false, // Público
        policies: [],
        middlewares: ['api::newsletter-subscription.rate-limit'],
      },
    },
    {
      method: 'POST',
      path: '/newsletter-subscriptions/unsubscribe',
      handler: 'newsletter-subscription.unsubscribe',
      config: {
        auth: false, // Público
        policies: [],
        middlewares: ['api::newsletter-subscription.rate-limit'],
      },
    },
    {
      method: 'GET',
      path: '/newsletter-subscriptions/stats',
      handler: 'newsletter-subscription.getStats',
      config: {
        auth: {
          scope: ['find'],
        },
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};

