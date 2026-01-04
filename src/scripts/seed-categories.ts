/**
 * Script para crear las categorías y subcategorías iniciales
 * Ejecutar con: npm run strapi console
 * Y luego: require('./src/scripts/seed-categories').default()
 */

const categoriesData = [
    {
        name: "Mantenimiento Locativo",
        slug: "mantenimiento-locativo",
        description: "Servicios de mantenimiento y reparación del hogar",
        icon: "🔧",
        order: 1,
        children: [
            {
                name: "Decoración de Interior",
                slug: "decoracion-interior",
                description: "Diseño y decoración de espacios interiores",
                icon: "🎨",
                order: 1
            },
            {
                name: "Plomería",
                slug: "plomeria",
                description: "Instalación y reparación de sistemas de agua",
                icon: "🚰",
                order: 2
            },
            {
                name: "Electricidad",
                slug: "electricidad",
                description: "Instalaciones y reparaciones eléctricas",
                icon: "⚡",
                order: 3
            },
            {
                name: "Techos e Impermeabilizantes",
                slug: "techos-impermeabilizantes",
                description: "Instalación y reparación de techos",
                icon: "🏠",
                order: 4
            },
            {
                name: "Pintura y Acabados",
                slug: "pintura-acabados",
                description: "Pintura de interiores y exteriores",
                icon: "🖌️",
                order: 5
            },
            {
                name: "Carpintería y Muebles",
                slug: "carpinteria-muebles",
                description: "Fabricación y reparación de muebles en madera",
                icon: "🪚",
                order: 6
            }
        ]
    },
    {
        name: "Jardinería",
        slug: "jardineria",
        description: "Servicios de jardines y áreas verdes",
        icon: "🌿",
        order: 2,
        children: [
            {
                name: "Podaje",
                slug: "podaje",
                description: "Poda de árboles y arbustos",
                icon: "✂️",
                order: 1
            },
            {
                name: "Siembra",
                slug: "siembra",
                description: "Siembra de plantas y árboles",
                icon: "🌱",
                order: 2
            },
            {
                name: "Diseño de Jardines",
                slug: "diseno-jardines",
                description: "Diseño y planificación de jardines",
                icon: "🏡",
                order: 3
            },
            {
                name: "Mantenimiento de Césped",
                slug: "mantenimiento-cesped",
                description: "Corte y cuidado del césped",
                icon: "🌾",
                order: 4
            },
            {
                name: "Control de Plagas",
                slug: "control-plagas",
                description: "Control y eliminación de plagas en jardines",
                icon: "🐛",
                order: 5
            },
            {
                name: "Sistemas de Riego",
                slug: "sistemas-riego",
                description: "Instalación y mantenimiento de sistemas de riego",
                icon: "💧",
                order: 6
            }
        ]
    },
    {
        name: "Niñeras",
        slug: "nineras",
        description: "Servicios de cuidado de niños",
        icon: "👶",
        order: 3,
        children: [
            {
                name: "Cuidado de Recién Nacidos",
                slug: "cuidado-recien-nacidos",
                description: "Cuidado especializado de bebés de 0 a 12 meses",
                icon: "🍼",
                order: 1
            },
            {
                name: "Cuidado de Niños (1-5 años)",
                slug: "cuidado-ninos-1-5",
                description: "Cuidado de niños en edad preescolar",
                icon: "🧸",
                order: 2
            },
            {
                name: "Cuidado de Niños Escolares",
                slug: "cuidado-ninos-escolares",
                description: "Apoyo y cuidado de niños en edad escolar",
                icon: "📚",
                order: 3
            },
            {
                name: "Niñera Nocturna",
                slug: "ninera-nocturna",
                description: "Cuidado de niños durante la noche",
                icon: "🌙",
                order: 4
            },
            {
                name: "Niñera por Horas",
                slug: "ninera-por-horas",
                description: "Servicio flexible de cuidado por horas",
                icon: "⏰",
                order: 5
            },
            {
                name: "Niñera con Idiomas",
                slug: "ninera-idiomas",
                description: "Niñeras con dominio de otros idiomas",
                icon: "🗣️",
                order: 6
            }
        ]
    },
    {
        name: "Aseo",
        slug: "aseo",
        description: "Servicios de limpieza del hogar",
        icon: "🧹",
        order: 4,
        children: [
            {
                name: "Limpieza General del Hogar",
                slug: "limpieza-general",
                description: "Limpieza regular y mantenimiento del hogar",
                icon: "🏡",
                order: 1
            },
            {
                name: "Limpieza Profunda",
                slug: "limpieza-profunda",
                description: "Limpieza detallada y exhaustiva",
                icon: "✨",
                order: 2
            },
            {
                name: "Lavado de Alfombras y Tapicería",
                slug: "lavado-alfombras-tapiceria",
                description: "Limpieza especializada de textiles",
                icon: "🛋️",
                order: 3
            },
            {
                name: "Limpieza de Ventanas",
                slug: "limpieza-ventanas",
                description: "Limpieza de ventanas y vidrios",
                icon: "🪟",
                order: 4
            },
            {
                name: "Desinfección y Sanitización",
                slug: "desinfeccion-sanitizacion",
                description: "Desinfección profunda de espacios",
                icon: "🧴",
                order: 5
            },
            {
                name: "Organización de Espacios",
                slug: "organizacion-espacios",
                description: "Organización y optimización de espacios",
                icon: "📦",
                order: 6
            }
        ]
    }
];

async function seedCategories() {
    const categories = categoriesData;

    console.log('🌱 Iniciando seed de categorías...');

    for (const categoryData of categories) {
        try {
            // Extraer children antes de crear la categoría padre
            const { children, ...parentData } = categoryData;

            // Crear categoría padre
            const parent = await strapi.entityService.create('api::category.category', {
                data: {
                    ...parentData,
                    publishedAt: new Date()
                }
            });

            console.log(`✅ Creada categoría: ${parent.name}`);

            // Crear subcategorías
            if (children && children.length > 0) {
                for (const childData of children) {
                    const child = await strapi.entityService.create('api::category.category', {
                        data: {
                            ...childData,
                            parent: parent.id,
                            publishedAt: new Date()
                        }
                    });
                    console.log(`  ✅ Creada subcategoría: ${child.name}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error creando categoría ${categoryData.name}:`, error.message);
        }
    }

    console.log('🎉 Seed de categorías completado!');
}

export default seedCategories;

// Si se ejecuta directamente
if (require.main === module) {
    seedCategories()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
