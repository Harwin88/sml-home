/**
 * faq router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::faq.faq', {
  config: {
    find: {
      auth: false, // Acceso público
    },
    findOne: {
      auth: false, // Acceso público
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

