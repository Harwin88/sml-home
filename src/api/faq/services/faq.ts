/**
 * faq service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::faq.faq', ({ strapi }) => ({
  /**
   * Sincronizar FAQs desde el frontend
   * Útil para mantener las FAQs hardcodeadas sincronizadas con la BD
   */
  async syncFromFrontend(faqs: any[]) {
    try {
      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
      };

      for (const faqData of faqs) {
        // Buscar FAQ existente por pregunta
        const existing = await strapi.db.query('api::faq.faq').findOne({
          where: { question: faqData.question },
        });

        if (existing) {
          // Actualizar solo si hay cambios
          if (existing.answer !== faqData.answer || existing.category !== faqData.category) {
            await strapi.entityService.update('api::faq.faq', existing.id, {
              data: faqData,
            });
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          // Crear nueva FAQ
          await strapi.entityService.create('api::faq.faq', {
            data: {
              ...faqData,
              publishedAt: new Date(),
            },
          });
          results.created++;
        }
      }

      strapi.log.info('FAQs sincronizadas:', results);
      return results;
    } catch (error) {
      strapi.log.error('Error al sincronizar FAQs:', error);
      throw error;
    }
  },

  /**
   * Sugerir FAQs relacionadas basadas en keywords
   */
  async suggestRelated(faqId: number, limit = 5) {
    try {
      const faq = await strapi.entityService.findOne('api::faq.faq', faqId, {
        fields: ['category', 'keywords'],
      });

      if (!faq) return [];

      // Buscar FAQs de la misma categoría
      const related = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          category: faq.category,
          id: { $ne: faqId },
          publishedAt: { $notNull: true },
        },
        limit,
        sort: { isPopular: 'desc', viewCount: 'desc' },
      });

      return related;
    } catch (error) {
      strapi.log.error('Error al sugerir FAQs relacionadas:', error);
      return [];
    }
  },

  /**
   * Actualizar FAQs populares automáticamente basándose en métricas
   */
  async updatePopularFaqs() {
    try {
      const allFaqs = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          publishedAt: { $notNull: true },
        },
        fields: ['id', 'viewCount', 'helpfulCount', 'isPopular'],
      });

      // Calcular score para cada FAQ
      const faqsWithScore = allFaqs.map((faq: any) => ({
        ...faq,
        score: (faq.viewCount || 0) * 0.3 + (faq.helpfulCount || 0) * 0.7,
      }));

      // Ordenar por score
      faqsWithScore.sort((a, b) => b.score - a.score);

      // Top 10 son populares
      const topFaqs = faqsWithScore.slice(0, 10);
      const topIds = topFaqs.map(f => f.id);

      // Actualizar todas las FAQs
      for (const faq of allFaqs) {
        const shouldBePopular = topIds.includes(faq.id);
        if (faq.isPopular !== shouldBePopular) {
          await strapi.entityService.update('api::faq.faq', faq.id, {
            data: { isPopular: shouldBePopular },
          });
        }
      }

      strapi.log.info(`FAQs populares actualizadas: ${topIds.length} marcadas como populares`);
      return topIds.length;
    } catch (error) {
      strapi.log.error('Error al actualizar FAQs populares:', error);
      return 0;
    }
  },
}));

