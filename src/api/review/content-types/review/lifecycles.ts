/**
 * Review lifecycles
 * Actualiza automáticamente el rating y totalReviews del ServiceProvider
 * cuando se crea, actualiza o elimina una review aprobada/publicada
 */

export default {
  async afterCreate(event) {
    const { result } = event;
    await updateProviderRating(result, event);
  },

  async afterUpdate(event) {
    const { result } = event;
    await updateProviderRating(result, event);
  },

  async afterDelete(event) {
    const { result } = event;
    if (result?.serviceProvider) {
      await updateProviderRating(result, event);
    }
  },
};

/**
 * Actualizar el rating y totalReviews del ServiceProvider
 */
async function updateProviderRating(review: any, event: any) {
  const { strapi } = event;
  
  // Obtener el serviceProviderId desde la review
  let serviceProviderId: number | string | null = null;
  
  // En Strapi, el serviceProvider puede venir como objeto con id o directamente como id
  if (review.serviceProvider?.id) {
    serviceProviderId = review.serviceProvider.id;
  } else if (typeof review.serviceProvider === 'number' || typeof review.serviceProvider === 'string') {
    serviceProviderId = review.serviceProvider;
  }

  if (!serviceProviderId) {
    console.warn('Review sin serviceProvider asociado, no se puede actualizar rating');
    return;
  }

  try {
    // Obtener todas las reviews aprobadas y publicadas del proveedor
    const publishedReviews = await strapi.entityService.findMany('api::review.review', {
      filters: {
        serviceProvider: serviceProviderId,
        status: 'APPROVED',
        publishedAt: {
          $notNull: true,
        },
      },
      fields: ['rating'],
    });

    if (!publishedReviews || publishedReviews.length === 0) {
      // Si no hay reviews aprobadas, establecer rating a 0 y totalReviews a 0
      await strapi.entityService.update('api::service-provider.service-provider', serviceProviderId, {
        data: {
          rating: 0,
          totalReviews: 0,
        },
      });
      return;
    }

    // Calcular el promedio de ratings
    const totalRating = publishedReviews.reduce((sum: number, review: any) => sum + parseFloat(review.rating || 0), 0);
    const averageRating = totalRating / publishedReviews.length;
    const totalReviews = publishedReviews.length;

    // Actualizar el ServiceProvider
    await strapi.entityService.update('api::service-provider.service-provider', serviceProviderId, {
      data: {
        rating: parseFloat(averageRating.toFixed(2)),
        totalReviews: totalReviews,
      },
    });

    console.log(`Rating actualizado para ServiceProvider ${serviceProviderId}: ${averageRating.toFixed(2)} (${totalReviews} reviews)`);
  } catch (error) {
    console.error('Error al actualizar rating del ServiceProvider:', error);
  }
}

