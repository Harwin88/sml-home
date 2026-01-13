/**
 * Script para publicar todas las FAQs que estén en estado borrador (draft)
 * Actualiza el campo published_at con la fecha actual
 */

const { Client } = require('pg');

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5433, // Puerto de Docker (mapeado desde 5432)
  user: process.env.DATABASE_USERNAME || 'strapi',
  password: process.env.DATABASE_PASSWORD || 'strapi',
  database: process.env.DATABASE_NAME || 'msl_hogar'
};

async function publicarFAQs() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    
    console.log('\n' + '='.repeat(60));
    console.log('📤 PUBLICAR FAQs EN BORRADOR');
    console.log('='.repeat(60) + '\n');

    // 1. Contar FAQs en borrador
    const draftCount = await client.query(`
      SELECT COUNT(*) FROM faqs WHERE published_at IS NULL
    `);
    const total = parseInt(draftCount.rows[0].count);

    if (total === 0) {
      console.log('✅ No hay FAQs en borrador. Todas están publicadas.\n');
      return;
    }

    console.log(`📝 FAQs en borrador encontradas: ${total}\n`);
    console.log('🔄 Publicando...\n');

    // 2. Publicar todas las FAQs en borrador
    const result = await client.query(`
      UPDATE faqs 
      SET published_at = NOW(),
          updated_at = NOW()
      WHERE published_at IS NULL
      RETURNING id, document_id, question, category;
    `);

    console.log(`✅ ${result.rows.length} FAQs publicadas exitosamente:\n`);

    // Mostrar las FAQs publicadas
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. [${row.category}] ${row.question.substring(0, 60)}...`);
    });

    // 3. Verificar estado final
    console.log('\n' + '─'.repeat(60));
    console.log('📊 Estado final:\n');
    
    const finalStats = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN published_at IS NOT NULL THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN published_at IS NULL THEN 1 ELSE 0 END) as draft
      FROM faqs;
    `);

    const stats = finalStats.rows[0];
    console.log(`   Total FAQs: ${stats.total}`);
    console.log(`   ✅ Publicadas: ${stats.published}`);
    console.log(`   📝 Borradores: ${stats.draft}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ¡Proceso completado!\n');
    console.log('📝 Próximos pasos:\n');
    console.log('1. Verifica en Admin Panel:');
    console.log('   http://localhost:1338/admin/content-manager/collection-types/api::faq.faq\n');
    console.log('2. Verifica en el API:');
    console.log('   http://localhost:1338/api/faqs\n');
    console.log('3. Verifica en el Frontend:');
    console.log('   http://localhost:4200/help\n');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUCIÓN: La base de datos no está corriendo.');
      console.log('   Inicia PostgreSQL o verifica la configuración de conexión.\n');
    } else if (error.code === '42P01') {
      console.log('\n💡 SOLUCIÓN: La tabla "faqs" no existe.');
      console.log('   Inicia Strapi para que cree la tabla automáticamente:\n');
      console.log('   npm run develop\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar
publicarFAQs()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Error fatal:', err.message);
    process.exit(1);
  });

