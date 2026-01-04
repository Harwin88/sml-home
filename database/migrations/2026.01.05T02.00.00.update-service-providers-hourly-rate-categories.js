'use strict';

/**
 * Migración para:
 * 1. Agregar valores aleatorios de hourlyRate a los proveedores de servicio
 * 2. Asignar categorías a los proveedores que no las tengan
 */

// Rangos de precios por hora en COP (pesos colombianos)
// Estos rangos son razonables para servicios del hogar en Colombia
const HOURLY_RATE_RANGES = {
    economico: { min: 15000, max: 30000 },
    moderado: { min: 25000, max: 50000 },
    premium: { min: 40000, max: 80000 }
};

/**
 * Genera un valor aleatorio de hourlyRate basado en el priceRange
 */
function generateRandomHourlyRate(priceRange = 'moderado') {
    const range = HOURLY_RATE_RANGES[priceRange] || HOURLY_RATE_RANGES.moderado;
    const randomValue = Math.random() * (range.max - range.min) + range.min;
    // Redondear a 2 decimales
    return Math.round(randomValue * 100) / 100;
}

module.exports = {
    async up() {
        console.log('🔄 Iniciando migración: actualización de proveedores de servicio...');
        console.log('   - Agregando hourlyRate aleatorios');
        console.log('   - Asignando categorías a proveedores sin categorías\n');

        // Obtener todos los proveedores de servicio
        const providers = await strapi.entityService.findMany('api::service-provider.service-provider', {
            populate: ['categories'],
            filters: {}
        });

        console.log(`📋 Encontrados ${providers.length} proveedores para actualizar\n`);

        // Obtener todas las categorías disponibles (solo las que están activas)
        const allCategories = await strapi.entityService.findMany('api::category.category', {
            filters: {
                isActive: { $eq: true }
            }
        });

        if (allCategories.length === 0) {
            console.warn('⚠️  No se encontraron categorías activas. No se pueden asignar categorías.');
        } else {
            console.log(`📂 Categorías disponibles para asignar: ${allCategories.length}\n`);
        }

        let updatedRate = 0;
        let updatedCategories = 0;
        let skipped = 0;
        let errors = 0;

        for (const provider of providers) {
            try {
                // 1. Verificar y asignar hourlyRate
                const needsHourlyRateUpdate = provider.hourlyRate === null || 
                                              provider.hourlyRate === undefined || 
                                              provider.hourlyRate === 0 ||
                                              (typeof provider.hourlyRate === 'number' && provider.hourlyRate < 0.01);

                if (needsHourlyRateUpdate) {
                    const priceRange = provider.priceRange || 'moderado';
                    const newHourlyRate = generateRandomHourlyRate(priceRange);
                    
                    try {
                        // Usar db.query para actualizar directamente
                        await strapi.db.query('api::service-provider.service-provider').update({
                            where: { id: provider.id },
                            data: { hourlyRate: newHourlyRate }
                        });
                        updatedRate++;
                        console.log(`  ✅ ${provider.name}: hourlyRate = ${newHourlyRate.toLocaleString('es-CO')} COP (${priceRange})`);
                    } catch (rateError) {
                        console.error(`  ❌ Error actualizando hourlyRate para ${provider.name}:`, rateError.message);
                        errors++;
                    }
                }

                // 2. Verificar y asignar categoría
                const currentCategories = provider.categories || [];
                const hasCategories = Array.isArray(currentCategories) && currentCategories.length > 0;
                
                if (!hasCategories && allCategories.length > 0) {
                    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
                    
                    try {
                        // Obtener el proveedor actualizado para asegurar que tenemos el documentId correcto
                        const updatedProvider = await strapi.entityService.findOne('api::service-provider.service-provider', provider.documentId || provider.id, {
                            populate: ['categories']
                        });

                        if (!updatedProvider) {
                            console.error(`  ⚠️  No se pudo encontrar el proveedor ${provider.name} después de la actualización`);
                            errors++;
                            continue;
                        }

                        // Actualizar las categorías usando entityService
                        await strapi.entityService.update('api::service-provider.service-provider', updatedProvider.documentId || updatedProvider.id, {
                            data: {
                                categories: [randomCategory.id]
                            }
                        });
                        
                        updatedCategories++;
                        console.log(`  ✅ ${provider.name}: categoría asignada = ${randomCategory.name} (${randomCategory.slug})`);
                    } catch (categoryError) {
                        console.error(`  ❌ Error asignando categoría a ${provider.name}:`, categoryError.message);
                        // Intentar método alternativo con db.query
                        try {
                            // Para relaciones many-to-many, necesitamos usar la tabla de unión
                            // Pero primero intentemos simplemente usar el ID directamente
                            const linkTableName = 'categories_service_providers_links';
                            const knex = strapi.db.connection;
                            
                            // Verificar si ya existe
                            const existing = await knex(linkTableName)
                                .where({
                                    service_provider_id: provider.id,
                                    category_id: randomCategory.id
                                })
                                .first();

                            if (!existing) {
                                await knex(linkTableName).insert({
                                    service_provider_id: provider.id,
                                    category_id: randomCategory.id,
                                    category_order: 1,
                                    service_provider_order: 1
                                });
                                updatedCategories++;
                                console.log(`  ✅ ${provider.name}: categoría asignada (método alternativo) = ${randomCategory.name}`);
                            }
                        } catch (altError) {
                            console.error(`  ❌ Error también en método alternativo para ${provider.name}:`, altError.message);
                            errors++;
                        }
                    }
                }

                if (!needsHourlyRateUpdate && hasCategories) {
                    skipped++;
                }

            } catch (error) {
                console.error(`  ❌ Error procesando proveedor ${provider.name}:`, error.message);
                errors++;
            }
        }

        console.log(`\n🎉 Migración completada!`);
        console.log(`   💰 Proveedores con hourlyRate actualizado: ${updatedRate}`);
        console.log(`   🏷️  Proveedores con categorías asignadas: ${updatedCategories}`);
        console.log(`   ⏭️  Proveedores sin cambios: ${skipped}`);
        if (errors > 0) {
            console.log(`   ⚠️  Errores encontrados: ${errors}`);
        }
    },

    async down() {
        console.log('⚠️  Esta migración no se puede revertir automáticamente');
        console.log('   Los valores de hourlyRate y categorías asignadas se mantendrán en la base de datos');
    }
};
