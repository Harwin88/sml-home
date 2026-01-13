/**
 * support-ticket router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::support-ticket.support-ticket', {
  config: {
    find: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
    findOne: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
    create: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
    update: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
    delete: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
});

