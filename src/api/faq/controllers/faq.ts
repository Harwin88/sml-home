/**
 * faq controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::faq.faq', ({ strapi }) => ({
  // Sobrescribir el método find para asegurar respuesta correcta
  async find(ctx) {
    // Sanitizar la consulta
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    
    strapi.log.info('FAQ find query:', JSON.stringify(sanitizedQuery, null, 2));
    
    // Buscar las entidades
    const results = await strapi.documents('api::faq.faq').findMany({
      ...sanitizedQuery,
    });
    
    strapi.log.info(`FAQ find result: ${results.length} FAQs encontradas`);
    
    // Sanitizar y transformar los resultados
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults);
  },

  // Obtener FAQs por categoría
  async findByCategory(ctx) {
    const { category } = ctx.params;

    if (!category) {
      return ctx.badRequest('Category is required');
    }

    const sanitizedQuery = await this.sanitizeQuery(ctx);
    
    // Asegurar que filters sea un objeto
    const baseFilters = sanitizedQuery.filters && typeof sanitizedQuery.filters === 'object' 
      ? sanitizedQuery.filters 
      : {};

    const results = await strapi.documents('api::faq.faq').findMany({
      ...sanitizedQuery,
      filters: {
        ...baseFilters,
        category: { $eq: category },
      },
      sort: { order: 'asc' },
    });

    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults);
  },

  // Obtener FAQs populares
  async findPopular(ctx) {
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const results = await strapi.documents('api::faq.faq').findMany({
      ...sanitizedQuery,
      filters: {
        viewCount: { $gte: 10 },
      },
      sort: { viewCount: 'desc' },
      limit: 10,
    });

    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults);
  },

  // Buscar FAQs
  async search(ctx) {
    const query = ctx.query as { q?: string };
    const { q } = query;

    if (!q || q.length < 3) {
      return ctx.badRequest('Search term must be at least 3 characters');
    }

    // Normalizar el término de búsqueda
    const searchTerm = q.toLowerCase().trim();
    
    // Dividir en palabras (separadas por espacios)
    // Filtrar palabras muy cortas (< 3 caracteres) para evitar ruido
    const words = searchTerm
      .split(/\s+/)
      .filter(word => word.length >= 3);

    if (words.length === 0) {
      return ctx.badRequest('Search term must contain at least one word with 3+ characters');
    }

    // Buscar todas las FAQs
    const allFaqs = await strapi.documents('api::faq.faq').findMany({});

    // Filtrar FAQs que contengan al menos una de las palabras buscadas
    const results = allFaqs.filter((faq: any) => {
      const questionLower = (faq.question || '').toLowerCase();
      const answerLower = (faq.answer || '').toLowerCase();
      const keywordsLower = JSON.stringify(faq.keywords || []).toLowerCase();
      
      // Verificar si al menos una palabra está en la pregunta, respuesta o keywords
      return words.some(word => {
        return questionLower.includes(word) ||
               answerLower.includes(word) ||
               keywordsLower.includes(word);
      });
    });

    // Ordenar resultados por relevancia
    // 1. Priorizar si la palabra está en la pregunta
    // 2. Luego por número de palabras encontradas
    // 3. Finalmente por viewCount
    const scoredResults = results.map((faq: any) => {
      const questionLower = (faq.question || '').toLowerCase();
      const answerLower = (faq.answer || '').toLowerCase();
      
      // Contar cuántas palabras coinciden
      const matchCount = words.filter(word => 
        questionLower.includes(word) || answerLower.includes(word)
      ).length;
      
      // Bonus si está en la pregunta
      const inQuestion = words.some(word => questionLower.includes(word));
      
      return {
        faq,
        score: matchCount * 10 + (inQuestion ? 50 : 0) + (faq.viewCount || 0)
      };
    });

    // Ordenar por score descendente
    scoredResults.sort((a, b) => b.score - a.score);
    
    // Extraer solo las FAQs ordenadas
    const sortedResults = scoredResults.map(item => item.faq);

    const sanitizedResults = await this.sanitizeOutput(sortedResults, ctx);
    return this.transformResponse(sanitizedResults);
  },

  // Incrementar contador de vistas
  async incrementView(ctx) {
    const { id } = ctx.params;

    const faq = await strapi.documents('api::faq.faq').findOne({
      documentId: id,
    });

    if (!faq) {
      return ctx.notFound('FAQ not found');
    }

    const updatedFaq = await strapi.documents('api::faq.faq').update({
      documentId: id,
      data: {
        viewCount: (faq.viewCount || 0) + 1,
      },
    });

    // Retornar solo el contador de vistas en el formato que espera el frontend
    return {
      viewCount: updatedFaq.viewCount || 0
    };
  },

  // Marcar FAQ como útil
  async markHelpful(ctx) {
    const { id } = ctx.params;
    const { helpful } = ctx.request.body as { helpful: boolean };

    const faq = await strapi.documents('api::faq.faq').findOne({
      documentId: id,
    });

    if (!faq) {
      return ctx.notFound('FAQ not found');
    }

    const updatedFaq = await strapi.documents('api::faq.faq').update({
      documentId: id,
      data: helpful
        ? { helpfulCount: (faq.helpfulCount || 0) + 1 }
        : { notHelpfulCount: (faq.notHelpfulCount || 0) + 1 },
    });

    // Retornar solo los contadores en el formato que espera el frontend
    return {
      data: {
        helpfulCount: updatedFaq.helpfulCount || 0,
        notHelpfulCount: updatedFaq.notHelpfulCount || 0,
      }
    };
  },

  // Obtener estadísticas
  async stats(ctx) {
    const faqs = await strapi.documents('api::faq.faq').findMany({});

    const stats = {
      total: faqs.length,
      byCategory: {} as Record<string, number>,
      totalViews: 0,
      totalHelpful: 0,
      totalNotHelpful: 0,
    };

    faqs.forEach((faq: any) => {
      stats.byCategory[faq.category] = (stats.byCategory[faq.category] || 0) + 1;
      stats.totalViews += faq.viewCount || 0;
      stats.totalHelpful += faq.helpfulCount || 0;
      stats.totalNotHelpful += faq.notHelpfulCount || 0;
    });

    return stats;
  },
}));
