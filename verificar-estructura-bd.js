/**
 * Script para verificar la estructura de la tabla FAQs en PostgreSQL
 * y el estado de publicación de los datos
 */

const { Client } = require('pg');

// Configuración de la base de datos desde variables de entorno
// NOTA: Si usas Docker, el puerto es 5433 (mapeado desde 5432 del contenedor)
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5433, // Puerto de Docker
  user: process.env.DATABASE_USERNAME || 'strapi',
  password: process.env.DATABASE_PASSWORD || 'strapi',
  database: process.env.DATABASE_NAME || 'msl_hogar'
};

async function verificarBD() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('\n' + '='.repeat(70));
    console.log('🔍 VERIFICACIÓN DE ESTRUCTURA Y DATOS DE FAQs');
    console.log('='.repeat(70));
    
    console.log(`\n📊 Base de Datos: ${dbConfig.database}`);
    console.log(`🔌 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 Usuario: ${dbConfig.user}\n`);

    // 1. Verificar si la tabla existe
    console.log('1️⃣  Verificando si la tabla "faqs" existe...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'faqs'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('   ❌ La tabla "faqs" NO existe');
      console.log('   💡 Strapi creará la tabla automáticamente al iniciar\n');
      return;
    }
    console.log('   ✅ La tabla "faqs" existe\n');

    // 2. Verificar estructura de la tabla
    console.log('2️⃣  Verificando estructura de la tabla...');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'faqs'
      ORDER BY ordinal_position;
    `);
    
    console.log(`   📋 Columnas encontradas: ${columns.rows.length}`);
    
    // Verificar columnas críticas de Strapi 5
    const criticalColumns = ['id', 'document_id', 'published_at', 'locale', 'question', 'answer', 'category'];
    const foundColumns = columns.rows.map(c => c.column_name);
    
    console.log('\n   🔑 Columnas críticas de Strapi 5:');
    criticalColumns.forEach(col => {
      const exists = foundColumns.includes(col);
      console.log(`      ${exists ? '✅' : '❌'} ${col}`);
    });

    // 3. Contar registros totales
    console.log('\n3️⃣  Contando registros...');
    const totalCount = await client.query('SELECT COUNT(*) FROM faqs');
    const total = parseInt(totalCount.rows[0].count);
    console.log(`   📊 Total de registros en BD: ${total}`);

    if (total === 0) {
      console.log('   ⚠️  No hay registros en la tabla\n');
      mostrarSolucion('sin_datos');
      return;
    }

    // 4. Verificar estado de publicación
    console.log('\n4️⃣  Verificando estado de publicación...');
    const publishedCount = await client.query(`
      SELECT COUNT(*) FROM faqs WHERE published_at IS NOT NULL
    `);
    const draftCount = await client.query(`
      SELECT COUNT(*) FROM faqs WHERE published_at IS NULL
    `);
    
    const published = parseInt(publishedCount.rows[0].count);
    const draft = parseInt(draftCount.rows[0].count);
    
    console.log(`   ✅ Publicadas: ${published}`);
    console.log(`   📝 Borradores (draft): ${draft}`);

    if (draft > 0) {
      console.log(`\n   ⚠️  PROBLEMA ENCONTRADO: ${draft} FAQs están en estado BORRADOR`);
      console.log('   💡 Las FAQs en borrador NO son visibles en el API público\n');
    }

    // 5. Verificar locales
    console.log('5️⃣  Verificando locales...');
    const locales = await client.query(`
      SELECT locale, COUNT(*) as count
      FROM faqs
      GROUP BY locale;
    `);
    
    if (locales.rows.length > 0) {
      locales.rows.forEach(row => {
        console.log(`   📍 Locale "${row.locale || 'NULL'}": ${row.count} registros`);
      });
    }

    // 6. Mostrar muestra de datos
    if (total > 0) {
      console.log('\n6️⃣  Muestra de FAQs (primeras 3):');
      const sample = await client.query(`
        SELECT id, document_id, question, category, published_at, locale
        FROM faqs
        ORDER BY id
        LIMIT 3;
      `);
      
      sample.rows.forEach((row, i) => {
        console.log(`\n   FAQ ${i + 1}:`);
        console.log(`      ID: ${row.id}`);
        console.log(`      DocumentID: ${row.document_id}`);
        console.log(`      Pregunta: ${row.question?.substring(0, 50)}...`);
        console.log(`      Categoría: ${row.category}`);
        console.log(`      Estado: ${row.published_at ? '✅ Publicada' : '📝 Borrador'}`);
        console.log(`      Locale: ${row.locale || 'NULL'}`);
      });
    }

    // 7. Determinar el problema y mostrar solución
    console.log('\n' + '='.repeat(70));
    console.log('📋 DIAGNÓSTICO');
    console.log('='.repeat(70) + '\n');

    if (draft > 0 && published === 0) {
      mostrarSolucion('todo_draft');
    } else if (draft > 0) {
      mostrarSolucion('algunos_draft');
    } else if (published > 0) {
      mostrarSolucion('todo_ok_revisar_permisos');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUCIÓN: La base de datos no está corriendo.');
      console.log('   Inicia PostgreSQL o verifica la configuración de conexión.\n');
    } else if (error.code === '28P01') {
      console.log('\n💡 SOLUCIÓN: Error de autenticación.');
      console.log('   Verifica las credenciales de la base de datos.\n');
    }
  } finally {
    await client.end();
  }
}

function mostrarSolucion(tipo) {
  switch (tipo) {
    case 'sin_datos':
      console.log('🎯 SOLUCIÓN: Crear las FAQs');
      console.log('─'.repeat(70));
      console.log('\n1. Abre: http://localhost:1338/admin (inicia sesión)');
      console.log('2. Arrastra al navegador: backend/crear-faqs-admin.html');
      console.log('3. Click en "Crear Todas las FAQs"');
      console.log('4. Espera 30 segundos\n');
      break;

    case 'todo_draft':
      console.log('🎯 SOLUCIÓN: Publicar las FAQs en borrador');
      console.log('─'.repeat(70));
      console.log('\n⚠️  Todas las FAQs están en estado BORRADOR (draft)');
      console.log('   Las FAQs en borrador NO son visibles en el API público.\n');
      console.log('📝 OPCIONES PARA PUBLICAR:\n');
      console.log('OPCIÓN 1: Publicar manualmente en Admin Panel');
      console.log('   1. Abre: http://localhost:1338/admin/content-manager/collection-types/api::faq.faq');
      console.log('   2. Selecciona todas las FAQs');
      console.log('   3. Click en "Publish" (acción masiva)\n');
      console.log('OPCIÓN 2: Usar script SQL para publicar todas');
      console.log('   node publicar-faqs.js\n');
      console.log('OPCIÓN 3: Eliminar y recrear con el HTML');
      console.log('   (El HTML crea FAQs ya publicadas automáticamente)\n');
      break;

    case 'algunos_draft':
      console.log('🎯 SOLUCIÓN: Algunas FAQs están en borrador');
      console.log('─'.repeat(70));
      console.log('\nPublica las FAQs en borrador desde el Admin Panel:');
      console.log('   http://localhost:1338/admin/content-manager/collection-types/api::faq.faq\n');
      break;

    case 'todo_ok_revisar_permisos':
      console.log('✅ Las FAQs están publicadas correctamente');
      console.log('─'.repeat(70));
      console.log('\nSi aún no las ves en el API, verifica:');
      console.log('\n1️⃣  Permisos del API público:');
      console.log('   http://localhost:1338/admin/settings/users-permissions/roles');
      console.log('   → Public → FAQ → ✅ find, findOne\n');
      console.log('2️⃣  Prueba el API directamente:');
      console.log('   http://localhost:1338/api/faqs\n');
      console.log('3️⃣  Verifica el frontend:');
      console.log('   http://localhost:4200/help\n');
      break;
  }
}

// Ejecutar verificación
console.log('\n🚀 Iniciando verificación...\n');
verificarBD()
  .then(() => {
    console.log('✨ Verificación completada\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Error fatal:', err.message);
    process.exit(1);
  });

