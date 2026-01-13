/**
 * Custom FAQ routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/faqs/category/:category',
      handler: 'faq.findByCategory',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/faqs/popular',
      handler: 'faq.findPopular',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/faqs/search',
      handler: 'faq.search',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/faqs/:id/view',
      handler: 'faq.incrementView',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/faqs/:id/helpful',
      handler: 'faq.markHelpful',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/faqs/stats',
      handler: 'faq.stats',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};

