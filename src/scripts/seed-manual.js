/**
 * Script manual para crear categorías
 * Ejecutar: docker exec -it MSL-hogar-strapi node /app/dist/scripts/seed-manual.js
 */

const categoriesData = [
    {
        name: "Mantenimiento Locativo",
        slug: "mantenimiento-locativo",
        description: "Servicios de mantenimiento y reparación del hogar",
        icon: "🔧",
        order: 1,
        children: [
            { name: "Decoración de Interior", slug: "decoracion-interior", description: "Diseño y decoración de espacios interiores", icon: "🎨", order: 1 },
            { name: "Plomería", slug: "plomeria", description: "Instalación y reparación de sistemas de agua", icon: "🚰", order: 2 },
            { name: "Electricidad", slug: "electricidad", description: "Instalaciones y reparaciones eléctricas", icon: "⚡", order: 3 },
            { name: "Techos e Impermeabilizantes", slug: "techos-impermeabilizantes", description: "Instalación y reparación de techos", icon: "🏠", order: 4 },
            { name: "Pintura y Acab ados", slug: "pintura-acabados", description: "Pintura de interiores y exteriores", icon: "🖌️", order: 5 },
            { name: "Carpintería y Muebles", slug: "carpinteria-muebles", description: "Fabricación y reparación de muebles en madera", icon: "🪚", order: 6 }
        ]
    },
    {
        name: "Jardinería",
        slug: "jardineria",
        description: "Servicios de jardines y áreas verdes",
        icon: "🌿",
        order: 2,
        children: [
            { name: "Podaje", slug: "podaje", description: "Poda de árboles y arbustos", icon: "✂️", order: 1 },
            { name: "Siembra", slug: "siembra", description: "Siembra de plantas y árboles", icon: "🌱", order: 2 },
            { name: "Diseño de Jardines", slug: "diseno-jardines", description: "Diseño y planificación de jardines", icon: "🏡", order: 3 },
            { name: "Mantenimiento de Césped", slug: "mantenimiento-cesped", description: "Corte y cuidado del césped", icon: "🌾", order: 4 },
            { name: "Control de Plagas", slug: "control-plagas", description: "Control y eliminación de plagas en jardines", icon: "🐛", order: 5 },
            { name: "Sistemas de Riego", slug: "sistemas-riego", description: "Instalación y mantenimiento de sistemas de riego", icon: "💧", order: 6 }
        ]
    },
    {
        name: "Niñeras",
        slug: "nineras",
        description: "Servicios de cuidado de niños",
        icon: "👶",
        order: 3,
        children: [
            { name: "Cuidado de Recién Nacidos", slug: "cuidado-recien-nacidos", description: "Cuidado especializado de bebés de 0 a 12 meses", icon: "🍼", order: 1 },
            { name: "Cuidado de Niños (1-5 años)", slug: "cuidado-ninos-1-5", description: "Cuidado de niños en edad preescolar", icon: "🧸", order: 2 },
            { name: "Cuidado de Niños Escolares", slug: "cuidado-ninos-escolares", description: "Apoyo y cuidado de niños en edad escolar", icon: "📚", order: 3 },
            { name: "Niñera Nocturna", slug: "ninera-nocturna", description: "Cuidado de niños durante la noche", icon: "🌙", order: 4 },
            { name: "Niñera por Horas", slug: "ninera-por-horas", description: "Servicio flexible de cuidado por horas", icon: "⏰", order: 5 },
            { name: "Niñera con Idiomas", slug: "ninera-idiomas", description: "Niñeras con dominio de otros idiomas", icon: "🗣️", order: 6 }
        ]
    },
    {
        name: "Aseo",
        slug: "aseo",
        description: "Servicios de limpieza del hogar",
        icon: "🧹",
        order: 4,
        children: [
            { name: "Limpieza General del Hogar", slug: "limpieza-general", description: "Limpieza regular y mantenimiento del hogar", icon: "🏡", order: 1 },
            { name: "Limpieza Profunda", slug: "limpieza-profunda", description: "Limpieza detallada y exhaustiva", icon: "✨", order: 2 },
            { name: "Lavado de Alfombras y Tapicería", slug: "lavado-alfombras-tapiceria", description: "Limpieza especializada de textiles", icon: "🛋️", order: 3 },
            { name: "Limpieza de Ventanas", slug: "limpieza-ventanas", description: "Limpieza de ventanas y vidrios", icon: "🪟", order: 4 },
            { name: "Desinfección y Sanitización", slug: "desinfeccion-sanitizacion", description: "Desinfección profunda de espacios", icon: "🧴", order: 5 },
            { name: "Organización de Espacios", slug: "organizacion-espacios", description: "Organización y optimización de espacios", icon: "📦", order: 6 }
        ]
    }
];

const { Client } = require('pg');

async function seed() {
    const client = new Client({
        host: process.env.DATABASE_HOST || 'postgres',
        port: process.env.DATABASE_PORT || 5432,
        user: process.env.DATABASE_USERNAME || 'strapi',
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });

    try {
        await client.connect();
        console.log('🌱 Conectado a la base de datos');
        console.log(`📦 Usando base de datos: ${process.env.DATABASE_NAME}`);

        for (const categoryData of categoriesData) {
            const { children, ...parentData } = categoryData;

            // Insertar categoría padre
            const parentResult = await client.query(
                `INSERT INTO categories (name, slug, description, icon, "order", is_active, published_at, created_at, updated_at, created_by_id, updated_by_id, document_id, locale)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW(), NOW(), null, null, gen_random_uuid()::text, null)
         RETURNING id, name`,
                [parentData.name, parentData.slug, parentData.description, parentData.icon, parentData.order]
            );

            const parentId = parentResult.rows[0].id;
            console.log(`✅ Creada categoría: ${parentResult.rows[0].name} (ID: ${parentId})`);

            // Insertar subcategorías
            if (children && children.length > 0) {
                for (const childData of children) {
                    const childResult = await client.query(
                        `INSERT INTO categories (name, slug, description, icon, "order", is_active, parent_id, published_at, created_at, updated_at, created_by_id, updated_by_id, document_id, locale)
             VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW(), NOW(), null, null, gen_random_uuid()::text, null)
             RETURNING id, name`,
                        [childData.name, childData.slug, childData.description, childData.icon, childData.order, parentId]
                    );
                    console.log(`  ✅ Creada subcategoría: ${childResult.rows[0].name}`);
                }
            }
        }

        console.log('🎉 Seed completado exitosamente!');

        // Verificar total
        const countResult = await client.query('SELECT COUNT(*) FROM categories');
        console.log(`📊 Total de categorías en BD: ${countResult.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

seed()
    .then(() => {
        console.log('✨ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
