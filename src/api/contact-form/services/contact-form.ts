/**
 * contact-form service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::contact-form.contact-form', ({ strapi }) => ({
  /**
   * Enviar email de confirmación al usuario
   */
  async sendConfirmationEmail(contactForm: any) {
    try {
      // TODO: Implementar con plugin de email (ej: @strapi/plugin-email)
      strapi.log.info(`Email de confirmación a enviar a: ${contactForm.email}`);
      
      // Ejemplo de implementación:
      // await strapi.plugins['email'].services.email.send({
      //   to: contactForm.email,
      //   subject: `Confirmación - Ticket ${contactForm.ticketId}`,
      //   text: `Hemos recibido tu mensaje. Te responderemos pronto.`,
      //   html: `<p>Hola ${contactForm.name},</p><p>Hemos recibido tu mensaje...</p>`
      // });
      
      return true;
    } catch (error) {
      strapi.log.error('Error al enviar email de confirmación:', error);
      return false;
    }
  },

  /**
   * Notificar al equipo de soporte
   */
  async notifySupportTeam(contactForm: any) {
    try {
      strapi.log.info(`Notificación de nuevo formulario: ${contactForm.ticketId}`);
      
      // TODO: Implementar notificación (email, Slack, etc.)
      
      return true;
    } catch (error) {
      strapi.log.error('Error al notificar equipo de soporte:', error);
      return false;
    }
  },

  /**
   * Obtener estadísticas de formularios de contacto
   */
  async getStats(filters = {}) {
    const allForms = await strapi.entityService.findMany('api::contact-form.contact-form', {
      filters,
    });

    const stats = {
      total: allForms.length,
      byStatus: {},
      byType: {},
      byPriority: {},
    };

    allForms.forEach((form: any) => {
      // Por estado
      stats.byStatus[form.status] = (stats.byStatus[form.status] || 0) + 1;
      
      // Por tipo
      stats.byType[form.contactType] = (stats.byType[form.contactType] || 0) + 1;
      
      // Por prioridad
      stats.byPriority[form.priority] = (stats.byPriority[form.priority] || 0) + 1;
    });

    return stats;
  },
}));

