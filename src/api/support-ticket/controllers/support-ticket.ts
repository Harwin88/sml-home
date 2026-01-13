/**
 * support-ticket controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::support-ticket.support-ticket', ({ strapi }) => ({
  /**
   * Crear un nuevo ticket de soporte
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Generar número de ticket único
      const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Determinar prioridad automática según categoría
      const priorityMap = {
        'technical': 'high',
        'billing': 'high',
        'complaint': 'high',
        'general': 'normal',
        'suggestion': 'low',
      };
      
      const priority = data.priority || priorityMap[data.category] || 'normal';
      
      // Crear el ticket
      const ticket = await strapi.entityService.create('api::support-ticket.support-ticket', {
        data: {
          ...data,
          ticketNumber,
          priority,
          status: 'open',
          department: 'customer_service',
        },
        populate: ['assignedTo', 'relatedProvider', 'sourceForm', 'responses'],
      });

      // TODO: Enviar notificación al equipo asignado
      // TODO: Enviar confirmación al solicitante

      return {
        success: true,
        message: 'Ticket creado exitosamente',
        ticketNumber,
        data: ticket,
      };
    } catch (error) {
      strapi.log.error('Error al crear ticket:', error);
      ctx.throw(500, 'Error al crear el ticket');
    }
  },

  /**
   * Agregar respuesta a un ticket
   */
  async addResponse(ctx) {
    try {
      const { id } = ctx.params;
      const { response } = ctx.request.body;

      const ticket = await strapi.entityService.findOne('api::support-ticket.support-ticket', id, {
        populate: ['responses'],
      }) as any;

      if (!ticket) {
        return ctx.notFound('Ticket no encontrado');
      }

      const currentResponses = ticket.responses || [];
      const newResponse = {
        ...response,
        responseTime: new Date(),
      };

      // Calcular tiempo de primera respuesta si es la primera
      let firstResponseTime = ticket.firstResponseTime;
      if (!firstResponseTime && !response.isCustomerResponse) {
        const createdAt = new Date(ticket.createdAt);
        const responseTime = new Date();
        firstResponseTime = Math.floor((responseTime.getTime() - createdAt.getTime()) / (1000 * 60));
      }

      // Actualizar ticket
      const updatedTicket = await strapi.entityService.update(
        'api::support-ticket.support-ticket',
        id,
        {
          data: {
            responses: [...currentResponses, newResponse],
            firstResponseTime,
            status: response.isCustomerResponse ? 'waiting_customer' : 'in_progress',
          },
          populate: ['responses', 'assignedTo'],
        }
      );

      // TODO: Enviar notificación por email

      return {
        success: true,
        data: updatedTicket,
      };
    } catch (error) {
      strapi.log.error('Error al agregar respuesta:', error);
      ctx.throw(500, 'Error al agregar respuesta');
    }
  },

  /**
   * Resolver un ticket
   */
  async resolve(ctx) {
    try {
      const { id } = ctx.params;
      const { resolution, resolvedBy } = ctx.request.body;

      const ticket = await strapi.entityService.findOne('api::support-ticket.support-ticket', id);

      if (!ticket) {
        return ctx.notFound('Ticket no encontrado');
      }

      const now = new Date();
      const createdAt = new Date(ticket.createdAt);
      const resolutionTime = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

      const updatedTicket = await strapi.entityService.update(
        'api::support-ticket.support-ticket',
        id,
        {
          data: {
            status: 'resolved',
            resolution,
            resolvedAt: now,
            resolvedBy,
            resolutionTime,
          },
          populate: ['assignedTo', 'resolvedBy'],
        }
      );

      // TODO: Enviar email de resolución al cliente

      return {
        success: true,
        message: 'Ticket resuelto exitosamente',
        data: updatedTicket,
      };
    } catch (error) {
      strapi.log.error('Error al resolver ticket:', error);
      ctx.throw(500, 'Error al resolver ticket');
    }
  },

  /**
   * Cerrar un ticket
   */
  async close(ctx) {
    try {
      const { id } = ctx.params;

      const updatedTicket = await strapi.entityService.update(
        'api::support-ticket.support-ticket',
        id,
        {
          data: {
            status: 'closed',
            closedAt: new Date(),
          },
        }
      );

      return {
        success: true,
        message: 'Ticket cerrado',
        data: updatedTicket,
      };
    } catch (error) {
      strapi.log.error('Error al cerrar ticket:', error);
      ctx.throw(500, 'Error al cerrar ticket');
    }
  },

  /**
   * Asignar ticket a un usuario
   */
  async assign(ctx) {
    try {
      const { id } = ctx.params;
      const { userId, department } = ctx.request.body;

      const updatedTicket = await strapi.entityService.update(
        'api::support-ticket.support-ticket',
        id,
        {
          data: {
            assignedTo: userId,
            department: department || undefined,
            status: 'in_progress',
          },
          populate: ['assignedTo'],
        }
      );

      return {
        success: true,
        data: updatedTicket,
      };
    } catch (error) {
      strapi.log.error('Error al asignar ticket:', error);
      ctx.throw(500, 'Error al asignar ticket');
    }
  },

  /**
   * Obtener estadísticas de tickets
   */
  async stats(ctx) {
    try {
      const tickets = await strapi.entityService.findMany('api::support-ticket.support-ticket', {
        fields: ['status', 'priority', 'category', 'firstResponseTime', 'resolutionTime'],
      });

      const stats = {
        total: tickets.length,
        byStatus: {},
        byPriority: {},
        byCategory: {},
        avgFirstResponseTime: 0,
        avgResolutionTime: 0,
      };

      let totalFirstResponse = 0;
      let totalResolution = 0;
      let countFirstResponse = 0;
      let countResolution = 0;

      tickets.forEach((ticket: any) => {
        stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
        stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
        stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;

        if (ticket.firstResponseTime) {
          totalFirstResponse += ticket.firstResponseTime;
          countFirstResponse++;
        }

        if (ticket.resolutionTime) {
          totalResolution += ticket.resolutionTime;
          countResolution++;
        }
      });

      stats.avgFirstResponseTime = countFirstResponse > 0 
        ? Math.round(totalFirstResponse / countFirstResponse) 
        : 0;
      
      stats.avgResolutionTime = countResolution > 0 
        ? Math.round(totalResolution / countResolution) 
        : 0;

      return stats;
    } catch (error) {
      strapi.log.error('Error al obtener estadísticas:', error);
      ctx.throw(500, 'Error al obtener estadísticas');
    }
  },
}));

