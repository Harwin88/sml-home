/**
 * faq controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::faq.faq', ({ strapi }) => ({
  /**
   * Encontrar FAQs con filtros personalizados
   */
  async find(ctx) {
    const { query } = ctx;
    
    // Permitir acceso público a FAQs publicadas
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    
    const baseFilters = sanitizedQuery.filters && typeof sanitizedQuery.filters === 'object' 
      ? sanitizedQuery.filters 
      : {};
    
    const entities = await strapi.entityService.findMany('api::faq.faq', {
      ...sanitizedQuery,
      filters: {
        ...baseFilters,
        publishedAt: { $notNull: true }, // Solo FAQs publicadas
      },
      sort: { order: 'asc', createdAt: 'desc' },
      populate: ['relatedFaqs'],
    });

    return entities;
  },

  /**
   * Encontrar FAQs por categoría
   */
  async findByCategory(ctx) {
    try {
      const { category } = ctx.params;

      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          category,
          publishedAt: { $notNull: true },
        },
        sort: { order: 'asc', isPopular: 'desc' },
        populate: ['relatedFaqs'],
      });

      return {
        success: true,
        category,
        count: faqs.length,
        data: faqs,
      };
    } catch (error) {
      strapi.log.error('Error al buscar FAQs por categoría:', error);
      ctx.throw(500, 'Error al buscar FAQs');
    }
  },

  /**
   * Obtener FAQs populares
   */
  async findPopular(ctx) {
    try {
      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          isPopular: true,
          publishedAt: { $notNull: true },
        },
        sort: { viewCount: 'desc', helpfulCount: 'desc' },
        limit: 10,
      });

      return {
        success: true,
        data: faqs,
      };
    } catch (error) {
      strapi.log.error('Error al buscar FAQs populares:', error);
      ctx.throw(500, 'Error al buscar FAQs populares');
    }
  },

  /**
   * Buscar FAQs por keywords
   */
  async search(ctx) {
    try {
      const { q } = ctx.query as { q?: string };

      if (!q || q.length < 3) {
        return ctx.badRequest('La búsqueda debe tener al menos 3 caracteres');
      }

      const searchTerm = q.toLowerCase();

      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          $or: [
            { question: { $containsi: searchTerm } },
            { answer: { $containsi: searchTerm } },
            { keywords: { $contains: searchTerm } },
          ],
          publishedAt: { $notNull: true },
        },
        sort: { isPopular: 'desc', viewCount: 'desc' },
      });

      return {
        success: true,
        query: q,
        count: faqs.length,
        data: faqs,
      };
    } catch (error) {
      strapi.log.error('Error al buscar FAQs:', error);
      ctx.throw(500, 'Error en la búsqueda');
    }
  },

  /**
   * Incrementar contador de vistas
   */
  async incrementView(ctx) {
    try {
      const { id } = ctx.params;

      const faq = await strapi.entityService.findOne('api::faq.faq', id);

      if (!faq) {
        return ctx.notFound('FAQ no encontrada');
      }

      const updatedFaq = await strapi.entityService.update('api::faq.faq', id, {
        data: {
          viewCount: (faq.viewCount || 0) + 1,
        },
      });

      return {
        success: true,
        viewCount: updatedFaq.viewCount,
      };
    } catch (error) {
      strapi.log.error('Error al incrementar vistas:', error);
      ctx.throw(500, 'Error al actualizar vistas');
    }
  },

  /**
   * Marcar FAQ como útil
   */
  async markHelpful(ctx) {
    try {
      const { id } = ctx.params;
      const { helpful } = ctx.request.body;

      const faq = await strapi.entityService.findOne('api::faq.faq', id);

      if (!faq) {
        return ctx.notFound('FAQ no encontrada');
      }

      const updateData = helpful
        ? { helpfulCount: (faq.helpfulCount || 0) + 1 }
        : { notHelpfulCount: (faq.notHelpfulCount || 0) + 1 };

      const updatedFaq = await strapi.entityService.update('api::faq.faq', id, {
        data: updateData,
      });

      return {
        success: true,
        data: {
          helpfulCount: updatedFaq.helpfulCount,
          notHelpfulCount: updatedFaq.notHelpfulCount,
        },
      };
    } catch (error) {
      strapi.log.error('Error al marcar FAQ:', error);
      ctx.throw(500, 'Error al actualizar feedback');
    }
  },

  /**
   * Obtener estadísticas de FAQs
   */
  async stats(ctx) {
    try {
      const faqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          publishedAt: { $notNull: true },
        },
        fields: ['category', 'viewCount', 'helpfulCount', 'notHelpfulCount', 'isPopular'],
      });

      const stats = {
        total: faqs.length,
        totalViews: 0,
        totalHelpful: 0,
        totalNotHelpful: 0,
        byCategory: {},
        popular: 0,
      };

      faqs.forEach((faq: any) => {
        stats.totalViews += faq.viewCount || 0;
        stats.totalHelpful += faq.helpfulCount || 0;
        stats.totalNotHelpful += faq.notHelpfulCount || 0;
        
        if (faq.isPopular) {
          stats.popular++;
        }

        stats.byCategory[faq.category] = (stats.byCategory[faq.category] || 0) + 1;
      });

      const helpfulRate = stats.totalHelpful + stats.totalNotHelpful > 0
        ? Math.round((stats.totalHelpful / (stats.totalHelpful + stats.totalNotHelpful)) * 100)
        : 0;

      return {
        success: true,
        data: {
          ...stats,
          helpfulRate,
        },
      };
    } catch (error) {
      strapi.log.error('Error al obtener estadísticas de FAQs:', error);
      ctx.throw(500, 'Error al obtener estadísticas');
    }
  },
}));

