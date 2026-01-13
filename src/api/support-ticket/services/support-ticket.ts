/**
 * support-ticket service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::support-ticket.support-ticket', ({ strapi }) => ({
  /**
   * Enviar notificación de nuevo ticket
   */
  async notifyNewTicket(ticket: any) {
    try {
      strapi.log.info(`Nuevo ticket creado: ${ticket.ticketNumber}`);
      
      // TODO: Implementar envío de email/notificación
      // - Email al equipo de soporte
      // - Email de confirmación al cliente
      // - Notificación push/Slack según configuración
      
      return true;
    } catch (error) {
      strapi.log.error('Error al notificar nuevo ticket:', error);
      return false;
    }
  },

  /**
   * Enviar notificación de respuesta
   */
  async notifyResponse(ticket: any, response: any) {
    try {
      if (response.isCustomerResponse) {
        // Notificar al equipo de soporte
        strapi.log.info(`Nueva respuesta del cliente en ticket: ${ticket.ticketNumber}`);
      } else {
        // Notificar al cliente
        strapi.log.info(`Nueva respuesta del soporte en ticket: ${ticket.ticketNumber}`);
      }
      
      return true;
    } catch (error) {
      strapi.log.error('Error al notificar respuesta:', error);
      return false;
    }
  },

  /**
   * Auto-asignar ticket según reglas
   */
  async autoAssign(ticketId: number) {
    try {
      const ticket = await strapi.entityService.findOne(
        'api::support-ticket.support-ticket',
        ticketId
      );

      if (!ticket) return false;

      // TODO: Implementar lógica de auto-asignación
      // - Round-robin por departamento
      // - Por carga de trabajo
      // - Por especialización
      
      strapi.log.info(`Auto-asignación para ticket: ${ticket.ticketNumber}`);
      
      return true;
    } catch (error) {
      strapi.log.error('Error en auto-asignación:', error);
      return false;
    }
  },

  /**
   * Escalar ticket según tiempo sin respuesta
   */
  async escalateTickets() {
    try {
      const now = new Date();
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

      const ticketsToEscalate = await strapi.entityService.findMany(
        'api::support-ticket.support-ticket',
        {
          filters: {
            status: 'open',
            createdAt: { $lt: fourHoursAgo },
            firstResponseTime: null,
          },
        }
      );

      for (const ticket of ticketsToEscalate) {
        await strapi.entityService.update('api::support-ticket.support-ticket', ticket.id, {
          data: {
            priority: 'high',
          },
        });
        
        strapi.log.info(`Ticket escalado: ${ticket.ticketNumber}`);
      }

      return ticketsToEscalate.length;
    } catch (error) {
      strapi.log.error('Error al escalar tickets:', error);
      return 0;
    }
  },

  /**
   * Cerrar tickets resueltos automáticamente después de X días
   */
  async autoCloseResolvedTickets(daysOld = 7) {
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);

      const ticketsToClose = await strapi.entityService.findMany(
        'api::support-ticket.support-ticket',
        {
          filters: {
            status: 'resolved',
            resolvedAt: { $lt: cutoffDate },
          },
        }
      );

      for (const ticket of ticketsToClose) {
        await strapi.entityService.update('api::support-ticket.support-ticket', ticket.id, {
          data: {
            status: 'closed',
            closedAt: now,
          },
        });
        
        strapi.log.info(`Ticket cerrado automáticamente: ${ticket.ticketNumber}`);
      }

      return ticketsToClose.length;
    } catch (error) {
      strapi.log.error('Error al cerrar tickets automáticamente:', error);
      return 0;
    }
  },
}));

