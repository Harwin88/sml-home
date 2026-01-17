/**
 * featured-provider controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::featured-provider.featured-provider', ({ strapi }) => ({
  /**
   * Obtener el proveedor destacado activo
   * Devuelve el primer proveedor destacado activo con todos sus datos
   */
  async findActive(ctx) {
    try {
      // Obtener los featured providers activos SIN populate del provider
      // Solo devolvemos el ID del provider para que el frontend lo consulte después
      const featuredProviders: any[] = await strapi.entityService.findMany(
        'api::featured-provider.featured-provider',
        {
          filters: {
            isActive: { $eq: true }
          },
          // No hacer populate del provider, solo devolver el ID
          fields: ['id', 'order', 'isActive', 'featuredText', 'startDate', 'endDate'],
          sort: { order: 'asc' },
          limit: 1 // Solo necesitamos uno
        }
      );

      if (!featuredProviders || featuredProviders.length === 0) {
        return ctx.notFound('No hay proveedores destacados activos');
      }

      // Obtener el primero (más prioritario por order)
      const featured = featuredProviders[0] as any;

      // Obtener solo el documentId del provider relacionado
      // Necesitamos hacer un populate mínimo para obtener el documentId
      const featuredWithProvider = await strapi.entityService.findOne(
        'api::featured-provider.featured-provider',
        featured.id,
        {
          populate: {
            provider: true // Populate completo - documentId está disponible automáticamente
          }
        }
      );

      if (!featuredWithProvider || !(featuredWithProvider as any).provider) {
        return ctx.notFound('Proveedor no encontrado');
      }

      const provider = (featuredWithProvider as any).provider;
      const providerId = provider.documentId || provider.id;

      if (!providerId) {
        return ctx.notFound('ID del proveedor no encontrado');
      }

      // Devolver el featured provider con solo el documentId del provider
      return ctx.send({
        data: {
          id: featured.id,
          documentId: featured.documentId,
          order: featured.order,
          isActive: featured.isActive,
          featuredText: featured.featuredText,
          startDate: featured.startDate,
          endDate: featured.endDate,
          providerId: providerId
        }
      });
    } catch (error: any) {
      console.error('Error en findActive:', error);
      return ctx.internalServerError(error.message || 'Error al obtener proveedor destacado');
    }
  }
}));

