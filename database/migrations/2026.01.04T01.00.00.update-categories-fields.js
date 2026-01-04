'use strict';

// Mapeo de slugs a los campos faltantes
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

module.exports = {
    async up() {
        console.log('🔄 Iniciando migración: actualización de campos de categorías...');

        await strapi.db.transaction(async () => {
            // Obtener todas las categorías
            const categories = await strapi.entityService.findMany('api::category.category', {
                filters: {}
            });

            console.log(`📋 Encontradas ${categories.length} categorías para actualizar`);

            let updated = 0;
            let skipped = 0;

            for (const category of categories) {
                const updateData = categoryUpdates[category.slug];
                
                if (!updateData) {
                    console.warn(`⚠️  No se encontraron datos de actualización para: ${category.slug}`);
                    skipped++;
                    continue;
                }

                try {
                    // Método 1: Intentar con entityService.update usando documentId
                    const updatedCategory = await strapi.entityService.update('api::category.category', category.documentId || category.id, {
                        data: {
                            icon: updateData.icon,
                            order: updateData.order,
                            isActive: updateData.isActive
                        }
                    });

                    if (updatedCategory) {
                        console.log(`  ✅ Actualizada: ${category.name} (${category.slug}) - icon: ${updateData.icon}, order: ${updateData.order}, isActive: ${updateData.isActive}`);
                        updated++;
                    } else {
                        throw new Error('No se pudo actualizar la categoría');
                    }
                } catch (error) {
                    console.error(`  ⚠️  Error con entityService para ${category.name}:`, error.message);
                    // Método 2: Intentar actualización directa en base de datos
                    try {
                        const result = await strapi.db.query('api::category.category').update({
                            where: { id: category.id },
                            data: {
                                icon: updateData.icon,
                                order: updateData.order,
                                isActive: updateData.isActive
                            }
                        });
                        
                        if (result) {
                            console.log(`  ✅ Actualizada (método 2): ${category.name}`);
                            updated++;
                        } else {
                            console.error(`  ❌ No se pudo actualizar ${category.name} con ningún método`);
                        }
                    } catch (error2) {
                        console.error(`  ❌ Error también en método 2:`, error2.message);
                    }
                }
            }

            console.log(`\n🎉 Migración completada!`);
            console.log(`   ✅ Categorías actualizadas: ${updated}`);
            console.log(`   ⏭️  Categorías omitidas: ${skipped}`);
        });
    },

    async down() {
        console.log('⚠️  Esta migración no se puede revertir automáticamente');
    }
};

