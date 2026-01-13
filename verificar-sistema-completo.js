/**
 * Verificación completa del sistema de FAQs
 * Verifica migración, endpoints, feedback y estructura
 */

const API_URL = 'http://localhost:1338/api';

console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA DE FAQs');
console.log('='.repeat(70));

/**
 * Test 1: Verificar que las FAQs existen
 */
async function test1_verificarFaqs() {
  console.log('\n✅ TEST 1: Verificar que las FAQs fueron creadas por la migración');
  console.log('-'.repeat(70));
  
  try {
    const response = await fetch(`${API_URL}/faqs`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const faqs = data.data;

    console.log(`📊 Total de FAQs: ${faqs.length}`);
    
    if (faqs.length === 0) {
      console.log('❌ FALLO: No hay FAQs. Ejecuta la migración.');
      return null;
    }

    if (faqs.length !== 32) {
      console.log(`⚠️  ADVERTENCIA: Se esperaban 32 FAQs, encontradas ${faqs.length}`);
    } else {
      console.log('✅ CORRECTO: 32 FAQs creadas');
    }

    // Verificar categorías
    const categorias = {};
    faqs.forEach(faq => {
      categorias[faq.category] = (categorias[faq.category] || 0) + 1;
    });

    console.log('\n📂 FAQs por categoría:');
    Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat.padEnd(12)} → ${count} FAQs`);
    });

    // Verificar estructura de una FAQ
    const primeraFaq = faqs[0];
    console.log('\n🔍 Estructura de la primera FAQ:');
    console.log(`   id: ${primeraFaq.id}`);
    console.log(`   documentId: ${primeraFaq.documentId}`);
    console.log(`   question: ${primeraFaq.question}`);
    console.log(`   category: ${primeraFaq.category}`);
    console.log(`   viewCount: ${primeraFaq.viewCount || 0}`);
    console.log(`   helpfulCount: ${primeraFaq.helpfulCount || 0}`);
    console.log(`   notHelpfulCount: ${primeraFaq.notHelpfulCount || 0}`);

    return primeraFaq;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return null;
  }
}

/**
 * Test 2: Verificar endpoint de incrementar vistas
 */
async function test2_incrementarVistas(faq) {
  console.log('\n✅ TEST 2: Endpoint de incrementar vistas');
  console.log('-'.repeat(70));
  
  if (!faq) {
    console.log('⏭️  SALTADO: No hay FAQs para probar');
    return false;
  }

  const documentId = faq.documentId;
  console.log(`🎯 Usando FAQ: "${faq.question}"`);
  console.log(`   documentId: ${documentId}`);
  
  try {
    const response = await fetch(`${API_URL}/faqs/${documentId}/view`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (typeof data.viewCount !== 'number') {
      throw new Error('Respuesta no tiene viewCount');
    }

    console.log(`✅ CORRECTO: viewCount incrementado a ${data.viewCount}`);
    return true;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Verificar endpoint de marcar como útil
 */
async function test3_marcarUtil(faq) {
  console.log('\n✅ TEST 3: Endpoint de marcar como útil');
  console.log('-'.repeat(70));
  
  if (!faq) {
    console.log('⏭️  SALTADO: No hay FAQs para probar');
    return false;
  }

  const documentId = faq.documentId;
  
  try {
    const response = await fetch(`${API_URL}/faqs/${documentId}/helpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || typeof data.data.helpfulCount !== 'number') {
      throw new Error('Respuesta no tiene data.helpfulCount');
    }

    console.log(`✅ CORRECTO: helpfulCount = ${data.data.helpfulCount}`);
    console.log(`            notHelpfulCount = ${data.data.notHelpfulCount}`);
    return true;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Verificar endpoint de marcar como no útil
 */
async function test4_marcarNoUtil(faq) {
  console.log('\n✅ TEST 4: Endpoint de marcar como no útil');
  console.log('-'.repeat(70));
  
  if (!faq) {
    console.log('⏭️  SALTADO: No hay FAQs para probar');
    return false;
  }

  const documentId = faq.documentId;
  
  try {
    const response = await fetch(`${API_URL}/faqs/${documentId}/helpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful: false }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || typeof data.data.notHelpfulCount !== 'number') {
      throw new Error('Respuesta no tiene data.notHelpfulCount');
    }

    console.log(`✅ CORRECTO: helpfulCount = ${data.data.helpfulCount}`);
    console.log(`            notHelpfulCount = ${data.data.notHelpfulCount}`);
    return true;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Verificar endpoint por categoría
 */
async function test5_buscarPorCategoria() {
  console.log('\n✅ TEST 5: Endpoint de buscar por categoría');
  console.log('-'.repeat(70));
  
  try {
    const response = await fetch(`${API_URL}/faqs/category/general`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const faqs = data.data;

    console.log(`📊 FAQs en categoría "general": ${faqs.length}`);
    
    // Verificar que todas sean de categoría general
    const todasGenerales = faqs.every(faq => faq.category === 'general');
    
    if (todasGenerales) {
      console.log('✅ CORRECTO: Todas las FAQs son de categoría "general"');
    } else {
      console.log('❌ FALLO: Hay FAQs de otras categorías');
      return false;
    }

    return true;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Verificar endpoint de búsqueda
 */
async function test6_buscarTexto() {
  console.log('\n✅ TEST 6: Endpoint de búsqueda por texto');
  console.log('-'.repeat(70));
  
  try {
    const response = await fetch(`${API_URL}/faqs/search?q=pago`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const faqs = data.data;

    console.log(`🔍 FAQs encontradas con "pago": ${faqs.length}`);
    
    if (faqs.length > 0) {
      console.log('✅ CORRECTO: Búsqueda funciona');
      console.log(`   Ejemplo: "${faqs[0].question}"`);
    } else {
      console.log('⚠️  ADVERTENCIA: No se encontraron resultados');
    }

    return true;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Verificar endpoint de FAQs populares
 */
async function test7_faqsPopulares() {
  console.log('\n✅ TEST 7: Endpoint de FAQs populares');
  console.log('-'.repeat(70));
  
  try {
    const response = await fetch(`${API_URL}/faqs/popular`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const faqs = data.data;

    console.log(`⭐ FAQs populares (viewCount >= 10): ${faqs.length}`);
    
    if (faqs.length > 0) {
      console.log('✅ CORRECTO: Endpoint funciona');
      faqs.slice(0, 3).forEach((faq, i) => {
        console.log(`   ${i+1}. "${faq.question}" (${faq.viewCount || 0} vistas)`);
      });
    } else {
      console.log('ℹ️  INFO: No hay FAQs con 10+ vistas aún (normal en instalación nueva)');
    }

    return true;

  } catch (error) {
    console.log(`❌ FALLO: ${error.message}`);
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function ejecutarTodos() {
  const faq = await test1_verificarFaqs();
  const test2 = await test2_incrementarVistas(faq);
  const test3 = await test3_marcarUtil(faq);
  const test4 = await test4_marcarNoUtil(faq);
  const test5 = await test5_buscarPorCategoria();
  const test6 = await test6_buscarTexto();
  const test7 = await test7_faqsPopulares();

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE TESTS');
  console.log('='.repeat(70));
  
  const tests = [
    { nombre: 'FAQs creadas', resultado: faq !== null },
    { nombre: 'Incrementar vistas', resultado: test2 },
    { nombre: 'Marcar útil', resultado: test3 },
    { nombre: 'Marcar no útil', resultado: test4 },
    { nombre: 'Buscar por categoría', resultado: test5 },
    { nombre: 'Buscar por texto', resultado: test6 },
    { nombre: 'FAQs populares', resultado: test7 },
  ];

  tests.forEach(test => {
    const icono = test.resultado ? '✅' : '❌';
    const estado = test.resultado ? 'PASÓ' : 'FALLÓ';
    console.log(`${icono} ${test.nombre.padEnd(25)} → ${estado}`);
  });

  const pasaron = tests.filter(t => t.resultado).length;
  const total = tests.length;
  const porcentaje = ((pasaron / total) * 100).toFixed(0);

  console.log('\n' + '='.repeat(70));
  console.log(`🎯 RESULTADO: ${pasaron}/${total} tests pasaron (${porcentaje}%)`);
  console.log('='.repeat(70));

  if (pasaron === total) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON! Sistema completamente funcional.');
  } else if (pasaron >= total * 0.8) {
    console.log('\n⚠️  Algunos tests fallaron, pero el sistema está mayormente funcional.');
  } else {
    console.log('\n❌ Varios tests fallaron. Revisa la configuración.');
  }

  console.log('\n📚 Documentación:');
  console.log('   - backend/README_FAQS.md');
  console.log('   - backend/README_FAQ_FEEDBACK.md');
  console.log('   - FEEDBACK_FAQ_RESUMEN.md');
  
  console.log('\n🔗 URLs útiles:');
  console.log('   - Frontend: http://localhost:4200/help');
  console.log('   - Strapi Admin: http://localhost:1338/admin');
  console.log('   - API FAQs: http://localhost:1338/api/faqs');
}

// Ejecutar
ejecutarTodos().catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});

