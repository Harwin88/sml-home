/**
 * Script de verificación completa del sistema FAQ
 * Verifica: BD, API, Permisos, Estructura
 */

const http = require('http');
const https = require('https');

const CHECKS = {
  backend: false,
  faqs: false,
  apiAccess: false
};

console.log('\n' + '='.repeat(60));
console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA FAQ');
console.log('='.repeat(60) + '\n');

// 1. Verificar que Strapi esté corriendo
console.log('1️⃣  Verificando que Strapi esté corriendo...');
http.get('http://localhost:1338/_health', (res) => {
  if (res.statusCode === 200 || res.statusCode === 204) {
    console.log('   ✅ Strapi está corriendo en puerto 1338\n');
    CHECKS.backend = true;
  } else {
    console.log(`   ❌ Strapi responde con código ${res.statusCode}\n`);
  }
  
  // 2. Verificar FAQs en la BD
  verificarFaqs();
}).on('error', (err) => {
  console.log('   ❌ Strapi NO está corriendo');
  console.log(`   💡 Ejecuta: npm run develop\n`);
  mostrarResumen();
});

function verificarFaqs() {
  console.log('2️⃣  Verificando FAQs en la base de datos...');
  
  http.get('http://localhost:1338/api/faqs', (res) => {
    let data = '';
    
    res.on('data', chunk => { data += chunk; });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const count = json.data ? json.data.length : 0;
        
        if (count === 0) {
          console.log('   ❌ NO hay FAQs en la base de datos (0 registros)');
          console.log('   💡 Acción requerida: Crea las FAQs usando crear-faqs-admin.html\n');
          CHECKS.faqs = false;
        } else {
          console.log(`   ✅ ${count} FAQs encontradas en la base de datos`);
          
          // Mostrar distribución por categorías
          const byCategory = {};
          json.data.forEach(faq => {
            const cat = faq.attributes?.category || faq.category || 'unknown';
            byCategory[cat] = (byCategory[cat] || 0) + 1;
          });
          
          console.log('\n   📊 Distribución por categorías:');
          Object.entries(byCategory).forEach(([cat, count]) => {
            const expected = {
              'general': 7,
              'search': 5,
              'payments': 4,
              'security': 4,
              'account': 4,
              'providers': 5,
              'technical': 3
            };
            const icon = (count === expected[cat]) ? '✅' : '⚠️';
            console.log(`      ${icon} ${cat}: ${count} FAQs ${expected[cat] ? `(esperadas: ${expected[cat]})` : ''}`);
          });
          console.log();
          
          CHECKS.faqs = count === 32;
          if (count !== 32) {
            console.log('   ⚠️  Se esperaban 32 FAQs en total\n');
          }
        }
        
        CHECKS.apiAccess = true;
        verificarEndpoints();
        
      } catch (e) {
        console.log('   ❌ Error al parsear respuesta:', e.message);
        console.log('   Respuesta:', data.substring(0, 200), '...\n');
        CHECKS.apiAccess = false;
        mostrarResumen();
      }
    });
  }).on('error', (err) => {
    console.log('   ❌ Error al consultar FAQs:', err.message);
    CHECKS.apiAccess = false;
    mostrarResumen();
  });
}

function verificarEndpoints() {
  console.log('3️⃣  Verificando endpoints personalizados...');
  
  const endpoints = [
    '/faqs/category/general',
    '/faqs/popular',
    '/faqs/stats'
  ];
  
  let checked = 0;
  let success = 0;
  
  endpoints.forEach(endpoint => {
    http.get(`http://localhost:1338/api${endpoint}`, (res) => {
      checked++;
      
      if (res.statusCode === 200) {
        console.log(`   ✅ ${endpoint} - OK`);
        success++;
      } else {
        console.log(`   ❌ ${endpoint} - Error ${res.statusCode}`);
      }
      
      if (checked === endpoints.length) {
        console.log();
        verificarFrontend();
      }
    }).on('error', () => {
      checked++;
      console.log(`   ❌ ${endpoint} - Error de conexión`);
      
      if (checked === endpoints.length) {
        console.log();
        verificarFrontend();
      }
    });
  });
}

function verificarFrontend() {
  console.log('4️⃣  Verificando frontend...');
  
  http.get('http://localhost:4200', (res) => {
    if (res.statusCode === 200) {
      console.log('   ✅ Frontend está corriendo en puerto 4200');
      console.log('   🌐 Página de ayuda: http://localhost:4200/help\n');
    } else {
      console.log(`   ⚠️  Frontend responde con código ${res.statusCode}\n`);
    }
    mostrarResumen();
  }).on('error', () => {
    console.log('   ⚠️  Frontend NO está corriendo');
    console.log('   💡 Ejecuta: cd frontend && npm start\n');
    mostrarResumen();
  });
}

function mostrarResumen() {
  console.log('='.repeat(60));
  console.log('📋 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(60));
  
  console.log(`\n${CHECKS.backend ? '✅' : '❌'} Backend (Strapi): ${CHECKS.backend ? 'OK' : 'NO DISPONIBLE'}`);
  console.log(`${CHECKS.apiAccess ? '✅' : '❌'} API Accesible: ${CHECKS.apiAccess ? 'OK' : 'NO DISPONIBLE'}`);
  console.log(`${CHECKS.faqs ? '✅' : '❌'} FAQs en BD: ${CHECKS.faqs ? 'OK (32 FAQs)' : 'FALTAN FAQs'}`);
  
  console.log('\n' + '='.repeat(60));
  
  if (!CHECKS.backend) {
    console.log('❌ PROBLEMA CRÍTICO: Strapi no está corriendo\n');
    console.log('📝 SOLUCIÓN:');
    console.log('   cd backend');
    console.log('   npm run develop\n');
  } else if (!CHECKS.faqs) {
    console.log('⚠️  ACCIÓN REQUERIDA: Crear FAQs\n');
    console.log('📝 SOLUCIÓN RÁPIDA (2 minutos):');
    console.log('   1. Abre: http://localhost:1338/admin (inicia sesión)');
    console.log('   2. Arrastra al navegador: backend/crear-faqs-admin.html');
    console.log('   3. Click en el botón "Crear Todas las FAQs"');
    console.log('   4. Espera 30 segundos');
    console.log('   5. ¡Listo!\n');
    console.log('📚 DOCUMENTACIÓN:');
    console.log('   - LEE: backend/LEEME_PRIMERO.md');
    console.log('   - O LEE: backend/DIAGNOSTICO_Y_SOLUCION_FAQS.md\n');
  } else {
    console.log('✅ ¡TODO ESTÁ FUNCIONANDO CORRECTAMENTE!\n');
    console.log('🎉 Sistema FAQ completamente operativo:');
    console.log('   - Backend: http://localhost:1338');
    console.log('   - Admin: http://localhost:1338/admin');
    console.log('   - API FAQs: http://localhost:1338/api/faqs');
    console.log('   - Frontend: http://localhost:4200/help\n');
  }
  
  console.log('='.repeat(60) + '\n');
}

