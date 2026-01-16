const fs = require('fs');
const path = require('path');

// Ruta del .htaccess en la raíz del proyecto
const htaccessSource = path.resolve(__dirname, '../.htaccess');
// Ruta del directorio de salida del build
const distPath = path.resolve(__dirname, '../dist/kapi-frontend');

// Verificar que el .htaccess existe
if (!fs.existsSync(htaccessSource)) {
  console.warn('⚠️  Advertencia: .htaccess no encontrado en la raíz del proyecto');
  console.warn('   El archivo será necesario para el despliegue en Hostinger');
  process.exit(0);
}

// Verificar que el directorio dist existe
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: El directorio dist/kapi-frontend no existe.');
  console.error('   Ejecuta "npm run build" o "npm run build:prod" primero.');
  process.exit(1);
}

// Copiar .htaccess al directorio dist
try {
  const htaccessDest = path.join(distPath, '.htaccess');
  fs.copyFileSync(htaccessSource, htaccessDest);
  console.log('✅ .htaccess copiado a dist/kapi-frontend/');
  console.log('   Ahora puedes subir todo el contenido de dist/kapi-frontend/ a public_html/');
} catch (error) {
  console.error('❌ Error al copiar .htaccess:', error.message);
  process.exit(1);
}

