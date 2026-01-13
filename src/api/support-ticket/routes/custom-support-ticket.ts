/**
 * Custom Support Ticket routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/support-tickets/:id/response',
      handler: 'support-ticket.addResponse',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/support-tickets/:id/resolve',
      handler: 'support-ticket.resolve',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/support-tickets/:id/close',
      handler: 'support-ticket.close',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/support-tickets/:id/assign',
      handler: 'support-ticket.assign',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/support-tickets/stats',
      handler: 'support-ticket.stats',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};

