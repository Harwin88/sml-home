/**
 * form controller
 */

import { factories } from '@strapi/strapi'

const coreController = factories.createCoreController('api::form.form');

export default {
  ...coreController,
  async create(ctx) {
    const { strapi } = ctx;
    
    // Capturar IP address del cliente
    const getClientIp = (request: any): string => {
      // Intentar obtener la IP real si está detrás de un proxy
      const forwarded = request.headers['x-forwarded-for'];
      if (forwarded) {
        // x-forwarded-for puede contener múltiples IPs, tomar la primera
        return String(forwarded).split(',')[0].trim();
      }
      
      // Intentar x-real-ip
      const realIp = request.headers['x-real-ip'];
      if (realIp) {
        return String(realIp);
      }
      
      // Fallback a la IP de la conexión
      if (request.ip) {
        return String(request.ip);
      }
      
      if (request.socket?.remoteAddress) {
        return String(request.socket.remoteAddress);
      }
      
      return 'unknown';
    };

    // Capturar user agent
    const userAgent = ctx.request.headers['user-agent'] || 'unknown';

    // Obtener los datos del body
    const bodyData = ctx.request.body?.data || ctx.request.body || {};
    
    // Si la IP viene del frontend, usarla; si no, capturarla del request
    const clientIp = bodyData.ipAddress || getClientIp(ctx.request);
    const clientUserAgent = bodyData.userAgent || userAgent;
    
    // Agregar ipAddress y userAgent automáticamente (priorizar los del frontend)
    const formData = {
      ...bodyData,
      ipAddress: clientIp,
      userAgent: clientUserAgent,
      submittedAt: bodyData.submittedAt || new Date().toISOString()
    };

    // Log para debugging
    console.log('Form data being saved:', {
      ipAddress: formData.ipAddress,
      userAgent: formData.userAgent,
      formType: formData.formType,
      name: formData.name
    });

    // Modificar el body con los datos actualizados
    ctx.request.body = {
      ...ctx.request.body,
      data: formData
    };

    // Llamar al método create del controlador base
    return await (coreController as any).create(ctx);
  }
};

