'use strict';

const categoryUpdates = {
    // Categorías principales
    'mantenimiento-locativo': { icon: '🔧', order: 1, isActive: true },
    'jardineria': { icon: '🌿', order: 2, isActive: true },
    'nineras': { icon: '👶', order: 3, isActive: true },
    'aseo': { icon: '🧹', order: 4, isActive: true },
    
    // Subcategorías de Mantenimiento Locativo
    'decoracion-interior': { icon: '🎨', order: 1, isActive: true },
    'plomeria': { icon: '🚰', order: 2, isActive: true },
    'electricidad': { icon: '⚡', order: 3, isActive: true },
    'techos-impermeabilizantes': { icon: '🏠', order: 4, isActive: true },
    'pintura-acabados': { icon: '🖌️', order: 5, isActive: true },
    'carpinteria-muebles': { icon: '🪚', order: 6, isActive: true },
    
    // Subcategorías de Jardinería
    'podaje': { icon: '✂️', order: 1, isActive: true },
    'siembra': { icon: '🌱', order: 2, isActive: true },
    'diseno-jardines': { icon: '🏡', order: 3, isActive: true },
    'mantenimiento-cesped': { icon: '🌾', order: 4, isActive: true },
    'control-plagas': { icon: '🐛', order: 5, isActive: true },
    'sistemas-riego': { icon: '💧', order: 6, isActive: true },
    
    // Subcategorías de Niñeras
    'cuidado-recien-nacidos': { icon: '🍼', order: 1, isActive: true },
    'cuidado-ninos-1-5': { icon: '🧸', order: 2, isActive: true },
    'cuidado-ninos-escolares': { icon: '📚', order: 3, isActive: true },
    'ninera-nocturna': { icon: '🌙', order: 4, isActive: true },
    'ninera-por-horas': { icon: '⏰', order: 5, isActive: true },
    'ninera-idiomas': { icon: '🗣️', order: 6, isActive: true },
    
    // Subcategorías de Aseo
    'limpieza-general': { icon: '🏡', order: 1, isActive: true },
    'limpieza-profunda': { icon: '✨', order: 2, isActive: true },
    'lavado-alfombras-tapiceria': { icon: '🛋️', order: 3, isActive: true },
    'limpieza-ventanas': { icon: '🪟', order: 4, isActive: true },
    'desinfeccion-sanitizacion': { icon: '🧴', order: 5, isActive: true },
    'organizacion-espacios': { icon: '📦', order: 6, isActive: true }
};

async function updateCategories() {
    const Strapi = require('@strapi/strapi');
    const app = await Strapi().load();

    console.log('🔄 Actualizando campos de categorías...');

    try {
        const categories = await app.entityService.findMany('api::category.category', {
            filters: {}
        });

        console.log(`📋 Encontradas ${categories.length} categorías`);

        for (const category of categories) {
            const updateData = categoryUpdates[category.slug];
            
            if (!updateData) {
                console.warn(`⚠️  No hay datos para: ${category.slug}`);
                continue;
            }

            try {
                await app.entityService.update('api::category.category', category.documentId || category.id, {
                    data: {
                        icon: updateData.icon,
                        order: updateData.order,
                        isActive: updateData.isActive
                    }
                });

                console.log(`✅ ${category.name} actualizada`);
            } catch (error) {
                console.error(`❌ Error en ${category.name}:`, error.message);
            }
        }

        console.log('🎉 ¡Actualización completada!');
    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        await app.destroy();
        process.exit(0);
    }
}

updateCategories();


