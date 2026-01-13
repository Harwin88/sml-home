const http = require('http');

http.get('http://localhost:1338/api/faqs', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('\n📊 Estadísticas de FAQs:');
      console.log(`   Total FAQs creadas: ${json.data.length}`);
      console.log('\n✨ Primeras 5 FAQs:');
      json.data.slice(0, 5).forEach((faq, i) => {
        console.log(`   ${i + 1}. ${faq.question} (${faq.category})`);
      });
      console.log('\n📂 FAQs por categoría:');
      const byCategory = {};
      json.data.forEach(faq => {
        byCategory[faq.category] = (byCategory[faq.category] || 0) + 1;
      });
      Object.entries(byCategory).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} FAQs`);
      });
      console.log('\n✅ FAQs disponibles en: http://localhost:4200/help\n');
    } catch (e) {
      console.error('Error:', e.message);
      console.log('Respuesta:', data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Error al consultar FAQs:', err.message);
});

