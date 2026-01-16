const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const assetsDir = path.resolve(__dirname, '../src/assets');

// Asegurar que el directorio assets existe
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Obtener variables de entorno desde .env.local
const apiUrl = process.env['API_URL'] || process.env.API_URL || '';
const strapiKey = process.env['STRAPI_KEY'] || process.env.STRAPI_KEY || '';

// Validar que existan las variables requeridas
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ Error: El archivo .env.local no existe.');
  console.error('   Por favor, crea el archivo .env.local con las siguientes variables:');
  console.error('   API_URL=tu-url-aqui');
  console.error('   STRAPI_KEY=tu-key-aqui');
  process.exit(1);
}

if (!apiUrl) {
  console.warn('⚠️  Advertencia: API_URL no está definida en .env.local');
}
if (!strapiKey) {
  console.warn('⚠️  Advertencia: STRAPI_KEY no está definida en .env.local');
}

// Generar config.json
const config = {
  apiUrl: apiUrl,
  strapiKey: strapiKey
};

const configPath = path.join(assetsDir, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('✅ Archivo config.json generado desde .env.local');
console.log(`   API_URL: ${apiUrl}`);
console.log(`   STRAPI_KEY: ${strapiKey ? '***' + strapiKey.slice(-4) : '(vacío)'}`);
