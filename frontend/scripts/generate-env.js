const fs = require('fs');
const path = require('path');

const assetsDir = path.resolve(__dirname, '../src/assets');

// Asegurar que el directorio assets existe
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Intentar cargar archivos de entorno en orden de prioridad:
// 1. .env (para despliegue/hosting como Hostinger)
// 2. .env.local (para desarrollo local)
// 3. Variables del sistema (ya configuradas por el host)
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

let envLoaded = false;

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('📄 Cargando variables desde .env');
  envLoaded = true;
} else if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
  console.log('📄 Cargando variables desde .env.local');
  envLoaded = true;
}

// Si no se cargó ningún archivo, usar variables del sistema
if (!envLoaded) {
  console.log('🌐 Usando variables de entorno del sistema (despliegue)');
}

// Obtener variables de entorno (las de archivos .env se cargan primero, luego se sobrescriben con variables del sistema si existen)
// Nota: en hosting como Hostinger, las variables del sistema tienen prioridad sobre archivos .env
const apiUrl = process.env['API_URL'] || process.env.API_URL || '';
const strapiKey = process.env['STRAPI_KEY'] || process.env.STRAPI_KEY || '';

// Validar que existan las variables requeridas
if (!apiUrl) {
  console.error('❌ Error: API_URL no está definida.');
  console.error('   Por favor, proporciona API_URL como:');
  console.error('   - Variable de entorno del sistema (despliegue/Hostinger), o');
  console.error('   - En el archivo .env (hosting), o');
  console.error('   - En el archivo .env.local (desarrollo local)');
  process.exit(1);
}

if (!strapiKey) {
  console.warn('⚠️  Advertencia: STRAPI_KEY no está definida (puede ser opcional)');
}

// Generar config.json
const config = {
  apiUrl: apiUrl,
  strapiKey: strapiKey
};

const configPath = path.join(assetsDir, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('✅ Archivo config.json generado exitosamente');
console.log(`   API_URL: ${apiUrl}`);
console.log(`   STRAPI_KEY: ${strapiKey ? '***' + strapiKey.slice(-4) : '(vacío)'}`);
