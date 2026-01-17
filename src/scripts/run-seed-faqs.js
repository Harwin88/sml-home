/**
 * Script wrapper para ejecutar las semillas de FAQs en Heroku
 * Ejecutar con: node src/scripts/run-seed-faqs.js
 */

const Strapi = require('@strapi/strapi');

(async () => {
  let app;

  try {
    // Cargar Strapi
    app = await Strapi().load();
    
    console.log('✅ Strapi cargado correctamente');
    console.log('🌱 Iniciando seed de FAQs...\n');

    // Importar y ejecutar el script de seed
    const seedFaqs = require('./seed-faqs-exec.js');
    await seedFaqs({ strapi: app });

    console.log('\n✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.destroy();
    }
    process.exit(0);
  }
})();

