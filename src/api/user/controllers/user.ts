import { factories } from '@strapi/strapi';
import bcrypt from 'bcryptjs';

export default factories.createCoreController('api::user.user', ({ strapi }) => ({
  async register(ctx) {
    try {
      const { email, phone, latitude, longitude } = ctx.request.body;

      // Validaciones
      if (!email || !phone) {
        return ctx.badRequest('Email y teléfono son requeridos');
      }

      // Verificar si el usuario ya existe
      const existingUser = await strapi.db.query('api::user.user').findOne({
        where: {
          $or: [
            { email },
            { phone }
          ]
        }
      });

      if (existingUser) {
        return ctx.badRequest('El email o teléfono ya está registrado');
      }

      // La contraseña es el número de teléfono
      const hashedPassword = await bcrypt.hash(phone, 10);

      // Crear usuario personalizado
      const user = await strapi.entityService.create('api::user.user', {
        data: {
          email,
          phone,
          password: hashedPassword,
          latitude: latitude || null,
          longitude: longitude || null,
          userType: 'regular',
          publishedAt: new Date()
        }
      });

      // Generar token JWT usando el ID del usuario personalizado
      // Asegurarse de usar el ID numérico, no el documentId
      const userId = typeof user.id === 'number' ? user.id : parseInt(user.id);
      console.log('REGISTER: Generando JWT para usuario ID:', userId, 'Email:', user.email);
      console.log('REGISTER: user completo:', { id: user.id, documentId: user.documentId, email: user.email });
      
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: userId
      });
      console.log('REGISTER: Token generado:', token.substring(0, 30) + '...');
      
      // Verificar que el token se puede decodificar
      try {
        const testDecoded = strapi.plugins['users-permissions'].services.jwt.verify(token);
        console.log('REGISTER: Verificación del token - decoded completo:', JSON.stringify(testDecoded));
        console.log('REGISTER: decoded.id:', testDecoded.id, 'tipo:', typeof testDecoded.id);
      } catch (error) {
        console.error('REGISTER: Error al verificar token generado:', error);
      }

      console.log('REGISTER: Usuario creado - id:', user.id, 'documentId:', user.documentId);
      return ctx.send({
        jwt: token,
        user: {
          id: user.id,
          documentId: user.documentId,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          latitude: user.latitude,
          longitude: user.longitude
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      return ctx.internalServerError('Error al registrar usuario');
    }
  },

  async login(ctx) {
    try {
      const { email, phone } = ctx.request.body;

      if (!email && !phone) {
        return ctx.badRequest('Email o teléfono es requerido');
      }

      // Buscar usuario personalizado
      const user = await strapi.db.query('api::user.user').findOne({
        where: email ? { email } : { phone }
      });

      if (!user) {
        return ctx.badRequest('Credenciales inválidas');
      }

      // Verificar contraseña (el teléfono es la contraseña)
      const isValid = await bcrypt.compare(phone, user.password);

      if (!isValid) {
        return ctx.badRequest('Credenciales inválidas');
      }

      // Generar token JWT usando el ID del usuario personalizado
      // Asegurarse de usar el ID numérico, no el documentId
      const userId = typeof user.id === 'number' ? user.id : parseInt(String(user.id));
      console.log('LOGIN: Generando JWT para usuario ID:', userId, 'Email:', user.email);
      console.log('LOGIN: user completo:', { id: user.id, documentId: user.documentId, email: user.email });
      console.log('LOGIN: userId final (tipo):', typeof userId, 'valor:', userId);
      
      // Crear payload con id como número
      const payload = { id: Number(userId) };
      console.log('LOGIN: Payload del JWT:', JSON.stringify(payload));
      
      const token = strapi.plugins['users-permissions'].services.jwt.issue(payload);
      console.log('LOGIN: Token generado:', token.substring(0, 30) + '...');
      console.log('LOGIN: Usuario - id:', user.id, 'documentId:', user.documentId);
      
      // Verificar que el token se puede decodificar
      try {
        const testDecoded = strapi.plugins['users-permissions'].services.jwt.verify(token);
        console.log('LOGIN: Verificación del token - decoded completo:', JSON.stringify(testDecoded));
        console.log('LOGIN: decoded.id:', testDecoded.id, 'tipo:', typeof testDecoded.id);
        if (!testDecoded.id) {
          console.error('LOGIN: ⚠️ ADVERTENCIA: El token decodificado NO tiene id!');
        }
      } catch (error) {
        console.error('LOGIN: Error al verificar token generado:', error);
      }

      return ctx.send({
        jwt: token,
        user: {
          id: user.id,
          documentId: user.documentId,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          latitude: user.latitude,
          longitude: user.longitude
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return ctx.internalServerError('Error al iniciar sesión');
    }
  },

  async me(ctx) {
    try {
      // Validar token manualmente
      const authHeader = ctx.request.header.authorization;
      if (!authHeader) {
        return ctx.unauthorized('Token no proporcionado');
      }

      const token = authHeader.replace('Bearer ', '').replace('bearer ', '');
      if (!token) {
        return ctx.unauthorized('Token no proporcionado');
      }

      let decoded;
      try {
        decoded = strapi.plugins['users-permissions'].services.jwt.verify(token);
      } catch (error) {
        return ctx.unauthorized('Token inválido o expirado');
      }

      if (!decoded || !decoded.id) {
        return ctx.unauthorized('Token inválido');
      }

      const fullUser: any = await strapi.entityService.findOne('api::user.user', decoded.id, {
        populate: ['favorites', 'providerProfile', 'reservations', 'providerReservations']
      });

      if (!fullUser) {
        return ctx.notFound('Usuario no encontrado');
      }

      return ctx.send({
        id: fullUser.id,
        email: fullUser.email,
        phone: fullUser.phone,
        userType: fullUser.userType,
        latitude: fullUser.latitude,
        longitude: fullUser.longitude,
        favorites: fullUser.favorites || [],
        providerProfile: fullUser.providerProfile || null,
        reservations: fullUser.reservations || [],
        providerReservations: fullUser.providerReservations || []
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return ctx.internalServerError('Error al obtener información del usuario');
    }
  },

  async addFavorite(ctx) {
    try {
      console.log('addFavorite (sin JWT): Inicio');
      console.log('addFavorite: Params:', ctx.params);
      console.log('addFavorite: Body:', ctx.request.body);

      const { providerId } = ctx.params;
      const { userId, userDocumentId } = ctx.request.body || {};

      if (!providerId) {
        return ctx.badRequest('providerId es requerido');
      }

      // Determinar usuario a partir de userId o userDocumentId
      let currentUser: any = null;

      if (userId) {
        currentUser = await strapi.entityService.findOne('api::user.user', userId, {
          populate: ['favorites']
        });
      } else if (userDocumentId) {
        currentUser = await strapi.db.query('api::user.user').findOne({
          where: { documentId: userDocumentId },
          populate: { favorites: true }
        });
      } else {
        return ctx.badRequest('userId o userDocumentId es requerido');
      }

      if (!currentUser) {
        return ctx.notFound('Usuario no encontrado');
      }

      const userIdNum = currentUser.id;
      
      // Validar que providerId sea un número válido
      const providerIdNum = parseInt(providerId, 10);
      if (isNaN(providerIdNum)) {
        return ctx.badRequest('ID de proveedor inválido');
      }

      // Obtener el proveedor primero para verificar que existe
      const provider = await strapi.entityService.findOne('api::service-provider.service-provider', providerIdNum);
      if (!provider) {
        return ctx.notFound('Proveedor no encontrado');
      }

      // Verificar si ya está en favoritos
      const existingFavorites = (currentUser as any).favorites || [];
      
      console.log('addFavorite: Favoritos existentes:', existingFavorites.length);
      console.log('addFavorite: IDs de favoritos existentes:', existingFavorites.map((f: any) => f.id));
      
      // Verificar por id numérico para evitar duplicados
      const isFavorite = existingFavorites.some((fav: any) => {
        const favId = Number(fav.id);
        const favDocId = fav.documentId ? String(fav.documentId) : null;
        return favId === providerIdNum || (favDocId && Number(favDocId) === providerIdNum);
      });
      
      if (isFavorite) {
        console.log('addFavorite: Proveedor ya está en favoritos');
        return ctx.badRequest('El proveedor ya está en favoritos');
      }

      // Obtener los IDs numéricos de los favoritos existentes
      // En Strapi, los favoritos vienen como objetos con id, así que extraemos los ids
      const existingFavoriteIds = existingFavorites
        .map((fav: any) => {
          // Intentar obtener el id numérico
          const id = Number(fav.id);
          return isNaN(id) ? null : id;
        })
        .filter((id: number | null) => id !== null) as number[];

      console.log('addFavorite: IDs numéricos existentes:', existingFavoriteIds);
      console.log('addFavorite: ID del proveedor a agregar:', providerIdNum);

      // Agregar el nuevo ID a la lista (sin duplicados)
      const updatedFavoriteIds = [...new Set([...existingFavoriteIds, providerIdNum])];

      console.log('addFavorite: IDs finales a guardar:', updatedFavoriteIds);

      // Actualizar la relación many-to-many
      // En Strapi 5, para relaciones many-to-many, pasamos un array de IDs numéricos
      // Usamos 'as any' porque TypeScript no reconoce correctamente el tipo de relación many-to-many
      await strapi.entityService.update('api::user.user', userIdNum, {
        data: {
          favorites: updatedFavoriteIds as any
        }
      });

      // Verificar que se guardó correctamente
      const updatedUser: any = await strapi.entityService.findOne('api::user.user', userIdNum, {
        populate: ['favorites']
      });
      console.log('addFavorite: Favorito agregado exitosamente');
      console.log('addFavorite: Total favoritos después de guardar:', updatedUser.favorites?.length || 0);

      return ctx.send({ 
        message: 'Proveedor agregado a favoritos',
        favorites: updatedUser.favorites || []
      });
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      return ctx.internalServerError('Error al agregar favorito');
    }
  },

  async removeFavorite(ctx) {
    try {
      console.log('removeFavorite (sin JWT): Inicio');
      console.log('removeFavorite: Params:', ctx.params);
      console.log('removeFavorite: Body:', ctx.request.body);

      const { providerId } = ctx.params;
      const { userId, userDocumentId } = ctx.request.body || {};

      if (!providerId) {
        return ctx.badRequest('providerId es requerido');
      }

      // Determinar usuario a partir de userId o userDocumentId
      let currentUser: any = null;

      if (userId) {
        currentUser = await strapi.entityService.findOne('api::user.user', userId, {
          populate: ['favorites']
        });
      } else if (userDocumentId) {
        currentUser = await strapi.db.query('api::user.user').findOne({
          where: { documentId: userDocumentId },
          populate: { favorites: true }
        });
      } else {
        return ctx.badRequest('userId o userDocumentId es requerido');
      }

      if (!currentUser) {
        return ctx.notFound('Usuario no encontrado');
      }

      const userIdNum = currentUser.id;

      const providerIdNum = parseInt(providerId, 10);
      if (isNaN(providerIdNum)) {
        return ctx.badRequest('ID de proveedor inválido');
      }

      // Obtener usuario con favoritos (ya viene poblado)
      const existingFavorites = currentUser.favorites || [];

      // Obtener IDs numéricos de favoritos actuales
      const existingFavoriteIds = existingFavorites
        .map((fav: any) => {
          const id = fav && fav.id ? Number(fav.id) : NaN;
          return isNaN(id) ? null : id;
        })
        .filter((id: number | null) => id !== null) as number[];

      // Filtrar el proveedor que queremos remover
      const updatedFavoriteIds = existingFavoriteIds.filter(id => id !== providerIdNum);

      await strapi.entityService.update('api::user.user', userIdNum, {
        data: {
          favorites: updatedFavoriteIds as any
        }
      });

      console.log('Favorito removido. Total favoritos:', updatedFavoriteIds.length);

      return ctx.send({ message: 'Proveedor removido de favoritos' });
    } catch (error) {
      console.error('Error al remover favorito:', error);
      return ctx.internalServerError('Error al remover favorito');
    }
  },

  async getFavoritesByDocumentId(ctx) {
    try {
      const { documentId } = ctx.params;

      // Buscar usuario por documentId - populate solo lo esencial
      const user: any = await strapi.db.query('api::user.user').findOne({
        where: { documentId },
        populate: {
          favorites: {
            populate: ['photo']
          }
        }
      });

      if (!user) {
        return ctx.notFound('Usuario no encontrado');
      }

      const rawFavorites = user.favorites || [];
      
      // Eliminar duplicados de forma eficiente usando Map
      // Usar tanto id como documentId para identificar duplicados
      const favoritesMap = new Map();
      const seenIds = new Set();
      const seenDocumentIds = new Set();
      
      for (const fav of rawFavorites) {
        const id = fav.id ? Number(fav.id) : null;
        const documentId = fav.documentId ? String(fav.documentId) : null;
        
        // Verificar si ya vimos este favorito por id o documentId
        const isDuplicate = (id !== null && seenIds.has(id)) || 
                           (documentId !== null && seenDocumentIds.has(documentId));
        
        if (!isDuplicate) {
          // Usar el id como clave principal, o documentId si no hay id
          const key = id !== null ? String(id) : (documentId || String(Math.random()));
          favoritesMap.set(key, fav);
          
          if (id !== null) seenIds.add(id);
          if (documentId !== null) seenDocumentIds.add(documentId);
        }
      }
      
      return ctx.send(Array.from(favoritesMap.values()));
    } catch (error) {
      console.error('Error al obtener favoritos por documentId:', error);
      return ctx.internalServerError('Error al obtener favoritos');
    }
  },

  async getFavorites(ctx) {
    try {
      // Validar token manualmente
      console.log('getFavorites: Inicio');
      const authHeader = ctx.request.header.authorization;
      console.log('getFavorites: Authorization header:', authHeader ? 'presente' : 'ausente');
      
      if (!authHeader) {
        return ctx.unauthorized('Token no proporcionado');
      }

      const token = authHeader.replace('Bearer ', '').replace('bearer ', '');
      if (!token) {
        return ctx.unauthorized('Token no proporcionado');
      }

      console.log('getFavorites: Token recibido:', token.substring(0, 30) + '...');

      let decoded;
      try {
        decoded = strapi.plugins['users-permissions'].services.jwt.verify(token);
        console.log('getFavorites: Token decodificado completo:', JSON.stringify(decoded));
        console.log('getFavorites: decoded.id:', decoded.id);
        console.log('getFavorites: Tipo de decoded.id:', typeof decoded.id);
        console.log('getFavorites: Todas las keys de decoded:', Object.keys(decoded));
      } catch (error) {
        console.error('getFavorites: Error al verificar token:', error);
        return ctx.unauthorized('Token inválido o expirado');
      }

      if (!decoded) {
        console.error('getFavorites: decoded es null o undefined');
        return ctx.unauthorized('Token inválido');
      }

      // Intentar obtener el ID de diferentes formas
      const userId = decoded.id || decoded.userId || decoded.user?.id;
      console.log('getFavorites: userId extraído:', userId);

      if (!userId) {
        console.error('getFavorites: No se pudo extraer userId del token');
        console.error('getFavorites: decoded completo:', JSON.stringify(decoded));
        return ctx.unauthorized('Token inválido');
      }

      console.log('getFavorites: Buscando usuario con ID:', userId);
      const fullUser: any = await strapi.entityService.findOne(
        'api::user.user',
        userId,
        {
          populate: {
            favorites: {
              populate: ['photo', 'categories']
            }
          }
        }
      );

      if (!fullUser) {
        console.error('getFavorites: Usuario no encontrado con ID:', userId);
        return ctx.notFound('Usuario no encontrado');
      }

      const favorites = (fullUser as any).favorites || [];
      console.log('getFavorites: Usuario encontrado:', fullUser.email, 'Favoritos:', favorites.length);
      return ctx.send(favorites);
    } catch (error) {
      console.error('getFavorites: Error general:', error);
      return ctx.internalServerError('Error al obtener favoritos');
    }
  }
}));

