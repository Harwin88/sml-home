/**
 * contact-form router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::contact-form.contact-form', {
  config: {
    create: {
      auth: false, // Permitir envío sin autenticación
      policies: [],
      middlewares: ['api::contact-form.rate-limit'],
    },
    find: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
    findOne: {
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

