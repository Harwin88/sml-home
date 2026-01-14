/**
 * newsletter-subscription controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::newsletter-subscription.newsletter-subscription', ({ strapi }) => ({
  /**
   * Suscribir un email al newsletter
   * POST /api/newsletter-subscriptions/subscribe
   */
  async subscribe(ctx) {
    try {
      const { email, source } = ctx.request.body;

      // Validar que el email esté presente
      if (!email) {
        return ctx.badRequest('El email es requerido');
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('El formato del email no es válido');
      }

      // Obtener IP del cliente
      const ipAddress = ctx.request.ip || ctx.request.headers['x-forwarded-for'] || 'unknown';

      // Llamar al servicio
      const result = await strapi.service('api::newsletter-subscription.newsletter-subscription').subscribe(
        email,
        source || 'footer',
        ipAddress
      );

      if (result.reactivated) {
        return ctx.send({
          success: true,
          message: 'Tu suscripción ha sido reactivada exitosamente.',
          data: result.subscription,
        }, 200);
      }

      return ctx.send({
        success: true,
        message: 'Te has suscrito exitosamente a nuestro newsletter.',
        data: result.subscription,
      }, 201);
    } catch (error: any) {
      strapi.log.error('Error en subscribe:', error);

      // Manejar errores específicos
      if (error.message === 'EMAIL_ALREADY_SUBSCRIBED') {
        return ctx.send({
          success: false,
          message: 'Este email ya está suscrito a nuestro newsletter.',
          error: 'DUPLICATE_EMAIL',
        }, 409);
      }

      return ctx.internalServerError('Error al procesar tu suscripción. Por favor, intenta nuevamente.');
    }
  },

  /**
   * Cancelar suscripción
   * POST /api/newsletter-subscriptions/unsubscribe
   */
  async unsubscribe(ctx) {
    try {
      const { email } = ctx.request.body;

      // Validar que el email esté presente
      if (!email) {
        return ctx.badRequest('El email es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('El formato del email no es válido');
      }

      // Llamar al servicio
      const result = await strapi.service('api::newsletter-subscription.newsletter-subscription').unsubscribe(email);

      return ctx.send({
        success: true,
        message: 'Te has desuscrito exitosamente del newsletter.',
        data: result.subscription,
      }, 200);
    } catch (error: any) {
      strapi.log.error('Error en unsubscribe:', error);

      // Manejar errores específicos
      if (error.message === 'EMAIL_NOT_FOUND') {
        return ctx.send({
          success: false,
          message: 'Este email no está suscrito a nuestro newsletter.',
          error: 'EMAIL_NOT_FOUND',
        }, 404);
      }

      return ctx.internalServerError('Error al procesar tu solicitud. Por favor, intenta nuevamente.');
    }
  },

  /**
   * Obtener estadísticas (solo para admins)
   */
  async getStats(ctx) {
    try {
      const stats = await strapi.service('api::newsletter-subscription.newsletter-subscription').getStats();
      return ctx.send(stats, 200);
    } catch (error) {
      strapi.log.error('Error al obtener estadísticas:', error);
      return ctx.internalServerError('Error al obtener estadísticas.');
    }
  },
}));

