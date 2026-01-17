/**
 * service-provider controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::service-provider.service-provider', ({ strapi }) => ({
  /**
   * Sobrescribir findOne para buscar por documentId si el parámetro no es numérico
   */
  async findOne(ctx) {
    const { id } = ctx.params;

    // Si el id no es numérico, asumimos que es un documentId
    if (id && isNaN(Number(id))) {
      try {
        // Buscar por documentId usando db.query
        const provider = await strapi.db.query('api::service-provider.service-provider').findOne({
          where: { documentId: id },
          populate: {
            photo: true,
            categories: true,
            portfolio: true
          }
        });

        if (!provider) {
          return ctx.notFound('Proveedor no encontrado');
        }

        // Obtener el id numérico para usar con entityService y obtener populate completo
        const numericId = provider.id;
        const fullProvider = await strapi.entityService.findOne('api::service-provider.service-provider', numericId, {
          populate: {
            photo: true,
            categories: true,
            portfolio: true
          }
        });

        if (!fullProvider) {
          return ctx.notFound('Proveedor no encontrado');
        }

        // Formatear respuesta en el formato estándar de Strapi
        return ctx.send({
          data: fullProvider
        });
      } catch (error: any) {
        console.error('Error al buscar proveedor por documentId:', error);
        return ctx.internalServerError(error.message || 'Error al buscar proveedor');
      }
    }

    // Si es numérico, usar el comportamiento por defecto usando entityService
    try {
      const { id: numericId } = ctx.params;
      const entity = await strapi.entityService.findOne('api::service-provider.service-provider', numericId, {
        populate: {
          photo: true,
          categories: true,
          portfolio: true
        }
      });

      if (!entity) {
        return ctx.notFound();
      }

      return ctx.send({ data: entity });
    } catch (error: any) {
      return ctx.internalServerError(error.message || 'Error al buscar proveedor');
    }
  }
}));
