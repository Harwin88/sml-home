/**
 * contact-form controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::contact-form.contact-form', ({ strapi }) => ({
  /**
   * Crear un nuevo formulario de contacto y generar ticket automáticamente
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Obtener información adicional de la solicitud
      const ipAddress = ctx.request.ip || ctx.request.headers['x-forwarded-for'] || 'unknown';
      const userAgent = ctx.request.headers['user-agent'] || 'unknown';
      
      // Generar ticket ID único
      const ticketId = `KAPI-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Crear el formulario de contacto
      const contactForm = await strapi.entityService.create('api::contact-form.contact-form', {
        data: {
          ...data,
          ticketId,
          ipAddress,
          userAgent,
          source: 'website',
          status: 'new',
          priority: 'normal',
        },
      });

      // Crear ticket de soporte relacionado si es necesario
      if (data.contactType && ['technical', 'provider', 'account'].includes(data.contactType)) {
        const ticketNumber = `TKT-${Date.now()}`;
        
        const categoryMap = {
          'technical': 'technical',
          'provider': 'provider_issue',
          'account': 'account',
          'billing': 'billing',
          'general': 'general',
          'suggestion': 'suggestion',
          'other': 'other'
        };

        await strapi.entityService.create('api::support-ticket.support-ticket', {
          data: {
            ticketNumber,
            title: data.subject,
            description: data.message,
            category: categoryMap[data.contactType] || 'general',
            status: 'open',
            priority: 'normal',
            requesterName: data.name,
            requesterEmail: data.email,
            requesterPhone: data.phone,
            department: 'customer_service',
            sourceForm: contactForm.id,
          },
        });
      }

      // TODO: Enviar email de confirmación al usuario
      // TODO: Enviar notificación al equipo de soporte

      // Sanitizar la respuesta
      const sanitizedEntity = await strapi.entityService.findOne(
        'api::contact-form.contact-form',
        contactForm.id,
        {}
      );

      return {
        success: true,
        message: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.',
        ticketId,
        data: sanitizedEntity,
      };
    } catch (error) {
      strapi.log.error('Error al crear formulario de contacto:', error);
      ctx.throw(500, 'Error al procesar tu solicitud. Por favor, intenta nuevamente.');
    }
  },

  /**
   * Encontrar formularios con filtros personalizados
   */
  async find(ctx) {
    const { query } = ctx;
    
    // Solo admins pueden ver todos los formularios
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const entities = await strapi.entityService.findMany('api::contact-form.contact-form', {
      ...sanitizedQuery,
      sort: { createdAt: 'desc' },
    });

    return entities;
  },

  /**
   * Actualizar estado del formulario
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    const updatedForm = await strapi.entityService.update('api::contact-form.contact-form', id, {
      data: {
        ...data,
        respondedAt: data.status === 'resolved' ? new Date() : undefined,
      },
    });

    return updatedForm;
  },
}));

