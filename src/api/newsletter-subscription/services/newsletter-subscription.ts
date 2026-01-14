/**
 * newsletter-subscription service
 */

import { factories } from '@strapi/strapi';
import crypto from 'crypto';

export default factories.createCoreService('api::newsletter-subscription.newsletter-subscription', ({ strapi }) => ({
  /**
   * Suscribir un email al newsletter
   */
  async subscribe(email: string, source: string = 'footer', ipAddress?: string) {
    try {
      // Normalizar email (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim();

      // Verificar si ya existe
      const existing = await this.checkDuplicate(normalizedEmail);
      
      if (existing) {
        // Si existe pero está unsubscribed, reactivarlo
        if (existing.status === 'unsubscribed') {
          const updated = await strapi.entityService.update(
            'api::newsletter-subscription.newsletter-subscription',
            existing.id,
            {
              data: {
                status: 'active',
                source,
                subscribedAt: new Date(),
                unsubscribedAt: null,
                ipAddress,
                confirmed: true,
              },
            }
          );
          return { success: true, subscription: updated, reactivated: true };
        }
        
        // Si ya está activo, retornar error
        throw new Error('EMAIL_ALREADY_SUBSCRIBED');
      }

      // Generar token de confirmación
      const confirmationToken = crypto.randomBytes(32).toString('hex');

      // Crear nueva suscripción
      const subscription = await strapi.entityService.create('api::newsletter-subscription.newsletter-subscription', {
        data: {
          email: normalizedEmail,
          status: 'active',
          source,
          subscribedAt: new Date(),
          ipAddress,
          confirmationToken,
          confirmed: true, // Por ahora auto-confirmamos, se puede cambiar a false si se requiere doble opt-in
        },
      });

      return { success: true, subscription, reactivated: false };
    } catch (error: any) {
      strapi.log.error('Error al suscribir email:', error);
      throw error;
    }
  },

  /**
   * Cancelar suscripción (unsubscribe)
   */
  async unsubscribe(email: string) {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const subscription = await strapi.entityService.findMany('api::newsletter-subscription.newsletter-subscription', {
        filters: { email: normalizedEmail },
        limit: 1,
      });

      if (!subscription || subscription.length === 0) {
        throw new Error('EMAIL_NOT_FOUND');
      }

      const sub = subscription[0];

      // Si ya está unsubscribed, retornar éxito de todas formas
      if (sub.status === 'unsubscribed') {
        return { success: true, message: 'Ya estabas desuscrito' };
      }

      // Marcar como unsubscribed
      const updated = await strapi.entityService.update(
        'api::newsletter-subscription.newsletter-subscription',
        sub.id,
        {
          data: {
            status: 'unsubscribed',
            unsubscribedAt: new Date(),
          },
        }
      );

      return { success: true, subscription: updated };
    } catch (error: any) {
      strapi.log.error('Error al cancelar suscripción:', error);
      throw error;
    }
  },

  /**
   * Verificar si un email ya está suscrito
   */
  async checkDuplicate(email: string) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const existing = await strapi.entityService.findMany('api::newsletter-subscription.newsletter-subscription', {
        filters: { email: normalizedEmail },
        limit: 1,
      });

      return existing && existing.length > 0 ? existing[0] : null;
    } catch (error) {
      strapi.log.error('Error al verificar duplicado:', error);
      return null;
    }
  },

  /**
   * Obtener estadísticas de suscripciones
   */
  async getStats() {
    try {
      const allSubscriptions = await strapi.entityService.findMany('api::newsletter-subscription.newsletter-subscription', {
        filters: {},
      });

      const stats = {
        total: allSubscriptions.length,
        active: 0,
        unsubscribed: 0,
        bounced: 0,
        bySource: {} as Record<string, number>,
        recentSubscriptions: 0, // Últimos 30 días
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      allSubscriptions.forEach((sub: any) => {
        // Por estado
        if (sub.status === 'active') stats.active++;
        if (sub.status === 'unsubscribed') stats.unsubscribed++;
        if (sub.status === 'bounced') stats.bounced++;

        // Por fuente
        const source = sub.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;

        // Suscripciones recientes
        if (sub.subscribedAt && new Date(sub.subscribedAt) >= thirtyDaysAgo) {
          stats.recentSubscriptions++;
        }
      });

      return stats;
    } catch (error) {
      strapi.log.error('Error al obtener estadísticas:', error);
      return {
        total: 0,
        active: 0,
        unsubscribed: 0,
        bounced: 0,
        bySource: {},
        recentSubscriptions: 0,
      };
    }
  },
}));

