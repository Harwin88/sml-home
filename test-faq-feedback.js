/**
 * Script para probar la funcionalidad de feedback de FAQs
 * Prueba los endpoints de incrementar vistas y marcar como útil/no útil
 */

const API_URL = 'http://localhost:1338/api';

/**
 * Obtener todas las FAQs
 */
async function getAllFaqs() {
  console.log('\n📋 Obteniendo todas las FAQs...');
  try {
    const response = await fetch(`${API_URL}/faqs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.data.length} FAQs encontradas`);
    
    if (data.data.length > 0) {
      const firstFaq = data.data[0];
      console.log('\n📌 Primera FAQ:');
      console.log(`   ID: ${firstFaq.id}`);
      console.log(`   documentId: ${firstFaq.documentId}`);
      console.log(`   Pregunta: ${firstFaq.question}`);
      console.log(`   Categoría: ${firstFaq.category}`);
      console.log(`   Vistas: ${firstFaq.viewCount || 0}`);
      console.log(`   Útil: ${firstFaq.helpfulCount || 0}`);
      console.log(`   No útil: ${firstFaq.notHelpfulCount || 0}`);
      
      return firstFaq;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Incrementar contador de vistas
 */
async function testIncrementView(documentId) {
  console.log(`\n👁️ Incrementando vistas para FAQ ${documentId}...`);
  try {
    const response = await fetch(`${API_URL}/faqs/${documentId}/view`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta:', data);
    console.log(`   Nuevas vistas: ${data.viewCount}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error al incrementar vistas:', error.message);
    return null;
  }
}

/**
 * Marcar FAQ como útil
 */
async function testMarkHelpful(documentId, helpful = true) {
  console.log(`\n${helpful ? '👍' : '👎'} Marcando FAQ ${documentId} como ${helpful ? 'útil' : 'no útil'}...`);
  try {
    const response = await fetch(`${API_URL}/faqs/${documentId}/helpful`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ helpful }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta:', data);
    console.log(`   Útil: ${data.data.helpfulCount}`);
    console.log(`   No útil: ${data.data.notHelpfulCount}`);
    
    return data;
  } catch (error) {
    console.error('❌ Error al marcar feedback:', error.message);
    return null;
  }
}

/**
 * Obtener una FAQ específica
 */
async function getFaqById(documentId) {
  console.log(`\n🔍 Obteniendo FAQ ${documentId}...`);
  try {
    const response = await fetch(`${API_URL}/faqs/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ FAQ obtenida:');
    console.log(`   Pregunta: ${data.data.question}`);
    console.log(`   Vistas: ${data.data.viewCount || 0}`);
    console.log(`   Útil: ${data.data.helpfulCount || 0}`);
    console.log(`   No útil: ${data.data.notHelpfulCount || 0}`);
    
    return data.data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  console.log('🧪 PRUEBAS DE FUNCIONALIDAD DE FEEDBACK DE FAQs');
  console.log('='.repeat(60));

  // 1. Obtener todas las FAQs
  const firstFaq = await getAllFaqs();
  
  if (!firstFaq) {
    console.log('\n❌ No hay FAQs para probar. Ejecuta las migraciones primero.');
    return;
  }

  const documentId = firstFaq.documentId;
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Usando FAQ: "${firstFaq.question}"`);
  console.log(`   documentId: ${documentId}`);
  console.log('='.repeat(60));

  // 2. Incrementar vistas (3 veces)
  console.log('\n📊 PRUEBA 1: Incrementar vistas (3 veces)');
  await testIncrementView(documentId);
  await new Promise(resolve => setTimeout(resolve, 500));
  await testIncrementView(documentId);
  await new Promise(resolve => setTimeout(resolve, 500));
  await testIncrementView(documentId);

  // 3. Verificar cambios
  console.log('\n' + '='.repeat(60));
  await getFaqById(documentId);

  // 4. Marcar como útil (2 veces)
  console.log('\n📊 PRUEBA 2: Marcar como útil (2 veces)');
  await testMarkHelpful(documentId, true);
  await new Promise(resolve => setTimeout(resolve, 500));
  await testMarkHelpful(documentId, true);

  // 5. Marcar como no útil (1 vez)
  console.log('\n📊 PRUEBA 3: Marcar como no útil (1 vez)');
  await testMarkHelpful(documentId, false);

  // 6. Verificar cambios finales
  console.log('\n' + '='.repeat(60));
  console.log('📈 RESULTADO FINAL:');
  await getFaqById(documentId);

  console.log('\n' + '='.repeat(60));
  console.log('✅ PRUEBAS COMPLETADAS');
  console.log('='.repeat(60));
}

// Ejecutar pruebas
runTests().catch(console.error);

