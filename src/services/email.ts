/**
 * Servicio de envío de emails
 * 
 * NOTA: Para usar este servicio en producción, necesitas instalar y configurar:
 * npm install @strapi/plugin-email @strapi/provider-email-nodemailer
 * 
 * O usar un proveedor como SendGrid, Mailgun, AWS SES, etc.
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export default {
  /**
   * Enviar email genérico
   */
  async send(options: EmailOptions) {
    try {
      // TODO: Implementar con plugin de email de Strapi
      // await strapi.plugins['email'].services.email.send({
      //   to: options.to,
      //   from: options.from || 'soporte@mslhogar.com',
      //   subject: options.subject,
      //   text: options.text,
      //   html: options.html,
      // });

      console.log('📧 Email a enviar:');
      console.log('  To:', options.to);
      console.log('  Subject:', options.subject);
      console.log('  From:', options.from || 'soporte@mslhogar.com');
      
      return { success: true };
    } catch (error) {
      console.error('Error al enviar email:', error);
      return { success: false, error };
    }
  },

  /**
   * Email de confirmación de contacto
   */
  async sendContactConfirmation(contactForm: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-box { background: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 MSL Hogar</h1>
            <p>Confirmación de Mensaje Recibido</p>
          </div>
          <div class="content">
            <p>Hola <strong>${contactForm.name}</strong>,</p>
            
            <p>Hemos recibido tu mensaje exitosamente. Nuestro equipo de soporte lo revisará y te responderá lo antes posible.</p>
            
            <div class="ticket-box">
              <p><strong>Número de Ticket:</strong> ${contactForm.ticketId}</p>
              <p><strong>Tipo de Consulta:</strong> ${contactForm.contactType}</p>
              <p><strong>Asunto:</strong> ${contactForm.subject}</p>
            </div>
            
            <p><strong>Tu mensaje:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px;">${contactForm.message}</p>
            
            <p>Tiempo estimado de respuesta: <strong>24 horas hábiles</strong></p>
            
            <p>Si tu consulta es urgente, también puedes contactarnos por:</p>
            <ul>
              <li>📞 Teléfono: +57 300 123 4567</li>
              <li>💬 WhatsApp: +57 300 123 4567</li>
            </ul>
            
            <a href="https://mslhogar.com/help" class="btn">Centro de Ayuda</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MSL Hogar. Todos los derechos reservados.</p>
            <p>Bogotá, Colombia | soporte@mslhogar.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: contactForm.email,
      subject: `Confirmación - Ticket ${contactForm.ticketId} - MSL Hogar`,
      html,
    });
  },

  /**
   * Notificación al equipo de soporte
   */
  async notifySupportTeam(contactForm: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #666; }
          .priority-high { border-left: 4px solid #dc2626; }
          .priority-normal { border-left: 4px solid #10B981; }
          .btn { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚨 Nuevo Formulario de Contacto</h2>
            <p>Ticket: ${contactForm.ticketId}</p>
          </div>
          <div class="content">
            <div class="field ${contactForm.priority === 'high' ? 'priority-high' : 'priority-normal'}">
              <div class="label">Prioridad:</div>
              <div>${contactForm.priority.toUpperCase()}</div>
            </div>
            
            <div class="field">
              <div class="label">Tipo de Consulta:</div>
              <div>${contactForm.contactType}</div>
            </div>
            
            <div class="field">
              <div class="label">Nombre:</div>
              <div>${contactForm.name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div><a href="mailto:${contactForm.email}">${contactForm.email}</a></div>
            </div>
            
            ${contactForm.phone ? `
            <div class="field">
              <div class="label">Teléfono:</div>
              <div><a href="tel:${contactForm.phone}">${contactForm.phone}</a></div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Asunto:</div>
              <div>${contactForm.subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Mensaje:</div>
              <div>${contactForm.message}</div>
            </div>
            
            <div class="field">
              <div class="label">Información Adicional:</div>
              <div>
                <strong>IP:</strong> ${contactForm.ipAddress}<br>
                <strong>Fecha:</strong> ${new Date(contactForm.createdAt).toLocaleString('es-CO')}
              </div>
            </div>
            
            <a href="${process.env.STRAPI_ADMIN_URL || 'http://localhost:1337'}/admin/content-manager/collection-types/api::contact-form.contact-form/${contactForm.id}" class="btn">
              Ver en Admin Panel
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: process.env.SUPPORT_EMAIL || 'soporte@mslhogar.com',
      subject: `🚨 Nuevo Contacto - ${contactForm.contactType.toUpperCase()} - ${contactForm.ticketId}`,
      html,
      replyTo: contactForm.email,
    });
  },

  /**
   * Email de respuesta a ticket
   */
  async sendTicketResponse(ticket: any, response: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .response-box { background: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Nueva Respuesta a tu Ticket</h1>
            <p>${ticket.ticketNumber}</p>
          </div>
          <div class="content">
            <p>Hola <strong>${ticket.requesterName}</strong>,</p>
            
            <p>Hemos respondido a tu ticket. Aquí está nuestra respuesta:</p>
            
            <div class="response-box">
              <p><strong>${response.respondedBy}</strong> escribió:</p>
              <p>${response.message}</p>
              <p style="color: #666; font-size: 14px; margin-top: 15px;">
                ${new Date(response.responseTime).toLocaleString('es-CO')}
              </p>
            </div>
            
            <p>Si tienes preguntas adicionales, responde a este email o accede a tu ticket:</p>
            
            <a href="https://mslhogar.com/support/ticket/${ticket.ticketNumber}" class="btn">
              Ver Ticket Completo
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: ticket.requesterEmail,
      subject: `Nueva respuesta - Ticket ${ticket.ticketNumber} - MSL Hogar`,
      html,
    });
  },

  /**
   * Email de ticket resuelto
   */
  async sendTicketResolved(ticket: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .resolution-box { background: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0; }
          .rating { text-align: center; margin: 30px 0; }
          .star { font-size: 40px; color: #fbbf24; text-decoration: none; margin: 0 5px; }
          .btn { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Ticket Resuelto</h1>
            <p>${ticket.ticketNumber}</p>
          </div>
          <div class="content">
            <p>Hola <strong>${ticket.requesterName}</strong>,</p>
            
            <p>Tu ticket ha sido marcado como <strong>resuelto</strong>.</p>
            
            ${ticket.resolution ? `
            <div class="resolution-box">
              <p><strong>Resolución:</strong></p>
              <p>${ticket.resolution}</p>
            </div>
            ` : ''}
            
            <p>Si el problema persiste o tienes preguntas adicionales, no dudes en contactarnos nuevamente.</p>
            
            <div class="rating">
              <p><strong>¿Cómo fue tu experiencia?</strong></p>
              <div>
                <a href="https://mslhogar.com/rate-ticket/${ticket.ticketNumber}/5" class="star">⭐</a>
                <a href="https://mslhogar.com/rate-ticket/${ticket.ticketNumber}/4" class="star">⭐</a>
                <a href="https://mslhogar.com/rate-ticket/${ticket.ticketNumber}/3" class="star">⭐</a>
                <a href="https://mslhogar.com/rate-ticket/${ticket.ticketNumber}/2" class="star">⭐</a>
                <a href="https://mslhogar.com/rate-ticket/${ticket.ticketNumber}/1" class="star">⭐</a>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://mslhogar.com" class="btn">Volver al Sitio</a>
              <a href="https://mslhogar.com/help" class="btn">Centro de Ayuda</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: ticket.requesterEmail,
      subject: `✅ Ticket Resuelto - ${ticket.ticketNumber} - MSL Hogar`,
      html,
    });
  },
};

