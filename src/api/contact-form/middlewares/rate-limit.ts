/**
 * Rate limiting middleware para prevenir spam en formularios de contacto
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const ipAddress = ctx.request.ip || ctx.request.headers['x-forwarded-for'] || 'unknown';
    const cacheKey = `contact-form-rate-limit:${ipAddress}`;
    
    try {
      // Verificar cache (requiere redis o similar en producción)
      // Por ahora usamos un simple contador en memoria
      
      if (!global.rateLimitCache) {
        global.rateLimitCache = {};
      }

      const now = Date.now();
      const windowMs = 60 * 60 * 1000; // 1 hora
      const maxRequests = 5; // Máximo 5 envíos por hora

      if (!global.rateLimitCache[cacheKey]) {
        global.rateLimitCache[cacheKey] = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      const rateLimit = global.rateLimitCache[cacheKey];

      // Reset si ha pasado la ventana de tiempo
      if (now > rateLimit.resetTime) {
        rateLimit.count = 0;
        rateLimit.resetTime = now + windowMs;
      }

      // Verificar límite
      if (rateLimit.count >= maxRequests) {
        const remainingTime = Math.ceil((rateLimit.resetTime - now) / 1000 / 60); // minutos
        
        strapi.log.warn(`Rate limit excedido para IP: ${ipAddress}`);
        
        return ctx.tooManyRequests(
          `Has enviado demasiados mensajes. Por favor, intenta nuevamente en ${remainingTime} minutos.`
        );
      }

      // Incrementar contador
      rateLimit.count++;

      await next();
    } catch (error) {
      strapi.log.error('Error en rate limit middleware:', error);
      // En caso de error, permitir la request
      await next();
    }
  };
};

