export default (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      console.log('=== AUTH MIDDLEWARE: INICIO ===');
      console.log('Headers recibidos:', Object.keys(ctx.request.header));
      
      const authHeader = ctx.request.header.authorization;
      console.log('Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'NO PRESENTE');
      
      if (!authHeader) {
        console.error('AUTH MIDDLEWARE: No hay authorization header');
        return ctx.unauthorized('Missing or invalid credentials');
      }

      const token = authHeader.replace('Bearer ', '').replace('bearer ', '');
      
      if (!token) {
        console.error('AUTH MIDDLEWARE: Token vacío después de procesar');
        return ctx.unauthorized('Missing or invalid credentials');
      }

      console.log('AUTH MIDDLEWARE: Token a verificar:', token.substring(0, 30) + '...');

      // Verificar el token usando el servicio JWT de Strapi
      let decoded;
      try {
        decoded = strapi.plugins['users-permissions'].services.jwt.verify(token);
        console.log('AUTH MIDDLEWARE: Token decodificado exitosamente');
        console.log('AUTH MIDDLEWARE: User ID del token:', decoded.id);
      } catch (error) {
        console.error('AUTH MIDDLEWARE: Error al verificar token:', error.message);
        return ctx.unauthorized('Missing or invalid credentials');
      }

      if (!decoded || !decoded.id) {
        console.error('AUTH MIDDLEWARE: Token decodificado pero sin ID');
        return ctx.unauthorized('Missing or invalid credentials');
      }

      // Buscar el usuario personalizado directamente con el ID del token
      console.log('AUTH MIDDLEWARE: Buscando usuario con ID:', decoded.id);
      
      try {
        const user = await strapi.entityService.findOne('api::user.user', decoded.id);
        
        if (!user) {
          console.error('AUTH MIDDLEWARE: Usuario no encontrado con ID:', decoded.id);
          return ctx.unauthorized('Missing or invalid credentials');
        }

        console.log('AUTH MIDDLEWARE: Usuario encontrado:', user.email);

        // Agregar usuario a ctx.state para que esté disponible en el controlador
        ctx.state.user = user;

        console.log('AUTH MIDDLEWARE: Usuario agregado a ctx.state, continuando...');
        await next();
      } catch (error) {
        console.error('AUTH MIDDLEWARE: Error al buscar usuario:', error);
        return ctx.unauthorized('Missing or invalid credentials');
      }
    } catch (error) {
      console.error('AUTH MIDDLEWARE: Error general en middleware:', error);
      return ctx.internalServerError('Error de autenticación');
    }
  };
};

