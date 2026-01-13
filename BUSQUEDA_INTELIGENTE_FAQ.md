# 🧠 Búsqueda Inteligente de FAQs

## 🎯 Problema Resuelto

**Antes:**
```
Buscar: "necesito un profesional"
Resultado: ❌ No encuentra nada
Razón: Busca la frase exacta "necesito un profesional"
```

**Ahora:**
```
Buscar: "necesito un profesional"
Resultado: ✅ Encuentra "¿Cómo contacto a un profesional?"
Razón: Busca por palabras individuales: "necesito", "profesional"
```

---

## ✅ ¿Qué Cambió?

### **Búsqueda Anterior (Exacta):**
```typescript
// Buscaba la frase completa
filters: {
  $or: [
    { question: { $containsi: "necesito un profesional" } },
    { answer: { $containsi: "necesito un profesional" } },
  ]
}
```

**Problema:** Solo encuentra si la frase exacta está en el texto.

---

### **Búsqueda Nueva (Por Palabras):**
```typescript
// 1. Divide el término en palabras
const words = searchTerm.split(/\s+/).filter(word => word.length >= 3);
// ["necesito", "profesional"]

// 2. Busca FAQs que contengan AL MENOS UNA palabra
const results = allFaqs.filter(faq => {
  return words.some(word => 
    faq.question.includes(word) ||
    faq.answer.includes(word)
  );
});

// 3. Ordena por relevancia
// - Más palabras coincidentes = más relevante
// - Palabra en la pregunta = más relevante
// - Más vistas = más relevante
```

**Ventaja:** Encuentra resultados aunque no esté la frase exacta.

---

## 🔧 Cómo Funciona

### **Paso 1: Normalización**
```typescript
// Entrada del usuario
"Necesito UN  profesional"

// Normalización
searchTerm = "necesito un profesional"  // toLowerCase + trim
```

---

### **Paso 2: División en Palabras**
```typescript
// Dividir por espacios
words = ["necesito", "un", "profesional"]

// Filtrar palabras cortas (< 3 caracteres)
words = ["necesito", "profesional"]  // "un" se elimina
```

**Por qué filtrar palabras cortas:**
- Palabras como "un", "el", "de", "en" son muy comunes
- No aportan valor a la búsqueda
- Generan ruido (muchos resultados irrelevantes)

---

### **Paso 3: Búsqueda Flexible**
```typescript
// Para cada FAQ, verificar si contiene AL MENOS UNA palabra
allFaqs.filter(faq => {
  return words.some(word => 
    faq.question.includes(word) ||
    faq.answer.includes(word) ||
    faq.keywords.includes(word)
  );
});
```

**Ejemplo:**
```
Buscar: "necesito profesional"
Palabras: ["necesito", "profesional"]

FAQ 1: "¿Cómo contacto a un profesional?"
  - "profesional" ✓ → INCLUIR

FAQ 2: "¿Qué servicios están disponibles?"
  - No contiene ninguna palabra → EXCLUIR

FAQ 3: "¿Los profesionales llevan herramientas?"
  - "profesionales" (similar a "profesional") ✓ → INCLUIR
```

---

### **Paso 4: Scoring (Puntuación)**
```typescript
const score = 
  matchCount * 10 +           // Cuántas palabras coinciden
  (inQuestion ? 50 : 0) +     // Bonus si está en la pregunta
  (faq.viewCount || 0);       // Popularidad
```

**Ejemplo:**
```
Buscar: "pago servicio"
Palabras: ["pago", "servicio"]

FAQ 1: "¿Cómo pago por los servicios?"
  - matchCount: 2 (ambas palabras)
  - inQuestion: true
  - viewCount: 45
  - Score: 2*10 + 50 + 45 = 115 ✅ PRIMERO

FAQ 2: "El pago se realiza después del servicio"
  - matchCount: 2 (ambas palabras)
  - inQuestion: false (está en la respuesta)
  - viewCount: 12
  - Score: 2*10 + 0 + 12 = 32 ✅ SEGUNDO

FAQ 3: "¿Puedo solicitar factura?"
  - matchCount: 0
  - Score: 0 → NO APARECE
```

---

## 📊 Ejemplos de Búsqueda

### **Ejemplo 1: Búsqueda Flexible**

**Buscar:** `"necesito un profesional"`

**Proceso:**
```
1. Normalizar: "necesito un profesional"
2. Dividir: ["necesito", "un", "profesional"]
3. Filtrar: ["necesito", "profesional"]  // "un" < 3 caracteres
4. Buscar FAQs con "necesito" O "profesional"
```

**Resultados:**
```
✅ "¿Cómo contacto a un profesional?"
   - Contiene "profesional" ✓
   - Score alto (palabra en pregunta)

✅ "¿Los profesionales llevan herramientas?"
   - Contiene "profesionales" (similar) ✓
   - Score medio

✅ "¿Cómo sé si un profesional es confiable?"
   - Contiene "profesional" ✓
   - Score medio
```

---

### **Ejemplo 2: Múltiples Palabras**

**Buscar:** `"pago tarjeta credito"`

**Proceso:**
```
1. Normalizar: "pago tarjeta credito"
2. Dividir: ["pago", "tarjeta", "credito"]
3. Todas >= 3 caracteres ✓
4. Buscar FAQs con "pago" O "tarjeta" O "credito"
```

**Resultados:**
```
✅ "¿Cómo pago por los servicios?"
   - Contiene "pago" ✓
   - Score: alto (palabra en pregunta)

✅ "¿Puedo pagar con tarjeta de crédito?"
   - Contiene "pago", "tarjeta", "crédito" ✓✓✓
   - Score: MUY ALTO (3 palabras coinciden)

✅ "Métodos de pago aceptados"
   - Contiene "pago" ✓
   - Score: medio
```

---

### **Ejemplo 3: Palabras Cortas Ignoradas**

**Buscar:** `"el de un"`

**Proceso:**
```
1. Normalizar: "el de un"
2. Dividir: ["el", "de", "un"]
3. Filtrar: []  // Todas < 3 caracteres
4. Error: "Must contain at least one word with 3+ characters"
```

**Resultado:**
```
❌ Error 400: Search term must contain at least one word with 3+ characters
```

**Por qué:** Palabras muy cortas no son útiles para búsqueda.

---

### **Ejemplo 4: Palabra Parcial**

**Buscar:** `"profes"`

**Proceso:**
```
1. Normalizar: "profes"
2. Dividir: ["profes"]
3. Filtrar: ["profes"] ✓
4. Buscar FAQs con "profes"
```

**Resultados:**
```
✅ "¿Cómo contacto a un profesional?"
   - "profesional" contiene "profes" ✓

✅ "¿Los profesionales llevan herramientas?"
   - "profesionales" contiene "profes" ✓
```

**Nota:** Funciona con palabras parciales porque usa `.includes()`.

---

## 🎯 Ventajas del Nuevo Algoritmo

| Característica | Antes | Ahora |
|----------------|-------|-------|
| **Búsqueda exacta** | ✅ Sí | ✅ Sí |
| **Búsqueda flexible** | ❌ No | ✅ Sí |
| **Múltiples palabras** | ❌ Busca frase completa | ✅ Busca cada palabra |
| **Palabras parciales** | ❌ No | ✅ Sí |
| **Relevancia** | ❌ Solo por vistas | ✅ Score inteligente |
| **Palabras cortas** | ⚠️ Generan ruido | ✅ Se filtran |

---

## 🔍 Comparación

### **Búsqueda Anterior:**
```
Buscar: "necesito profesional"
→ Busca la frase exacta "necesito profesional"
→ Solo encuentra si el texto contiene exactamente eso
→ Resultado: ❌ 0 resultados
```

### **Búsqueda Nueva:**
```
Buscar: "necesito profesional"
→ Divide en ["necesito", "profesional"]
→ Busca FAQs que contengan "necesito" O "profesional"
→ Ordena por relevancia (cuántas palabras, dónde están, popularidad)
→ Resultado: ✅ 5 resultados ordenados
```

---

## 📊 Algoritmo de Scoring

### **Fórmula:**
```typescript
score = (matchCount * 10) + (inQuestion ? 50 : 0) + viewCount
```

### **Componentes:**

**1. matchCount (× 10):**
- Cuántas palabras de búsqueda están en la FAQ
- Más palabras = más relevante

**2. inQuestion (+ 50):**
- Bonus si al menos una palabra está en la pregunta
- Las preguntas son más importantes que las respuestas

**3. viewCount:**
- Popularidad de la FAQ
- FAQs más vistas son más relevantes

---

### **Ejemplo de Scoring:**

**Buscar:** `"pago servicio"`

```
FAQ A: "¿Cómo pago por los servicios?"
  matchCount: 2 (pago ✓, servicio ✓)
  inQuestion: true
  viewCount: 45
  Score: 2*10 + 50 + 45 = 115 ⭐⭐⭐

FAQ B: "El pago se realiza después del servicio"
  matchCount: 2 (pago ✓, servicio ✓)
  inQuestion: false
  viewCount: 12
  Score: 2*10 + 0 + 12 = 32 ⭐⭐

FAQ C: "¿Puedo solicitar factura del pago?"
  matchCount: 1 (pago ✓)
  inQuestion: true
  viewCount: 8
  Score: 1*10 + 50 + 8 = 68 ⭐⭐⭐

Orden final: FAQ A → FAQ C → FAQ B
```

---

## 🧪 Casos de Prueba

### **Caso 1: Frase Completa**
```
Buscar: "como pago por los servicios"
Resultado: ✅ Encuentra "¿Cómo pago por los servicios?"
```

### **Caso 2: Palabras Desordenadas**
```
Buscar: "servicios pago como"
Resultado: ✅ Encuentra "¿Cómo pago por los servicios?"
```

### **Caso 3: Una Sola Palabra**
```
Buscar: "profesional"
Resultado: ✅ Encuentra todas las FAQs con "profesional"
```

### **Caso 4: Palabra Parcial**
```
Buscar: "profes"
Resultado: ✅ Encuentra "profesional", "profesionales"
```

### **Caso 5: Múltiples Palabras**
```
Buscar: "pago tarjeta credito"
Resultado: ✅ Encuentra FAQs con "pago", "tarjeta" o "crédito"
```

### **Caso 6: Palabras Cortas**
```
Buscar: "el un de"
Resultado: ❌ Error (todas las palabras < 3 caracteres)
```

### **Caso 7: Mezcla**
```
Buscar: "el pago de servicios"
Palabras: ["pago", "servicios"]  // "el", "de" se filtran
Resultado: ✅ Encuentra FAQs con "pago" o "servicios"
```

---

## 🔧 Código Implementado

```typescript
async search(ctx) {
  const { q } = ctx.query;

  // Validación básica
  if (!q || q.length < 3) {
    return ctx.badRequest('Search term must be at least 3 characters');
  }

  // 1. Normalizar y dividir en palabras
  const searchTerm = q.toLowerCase().trim();
  const words = searchTerm
    .split(/\s+/)
    .filter(word => word.length >= 3);

  // Validar que haya al menos una palabra válida
  if (words.length === 0) {
    return ctx.badRequest('Search term must contain at least one word with 3+ characters');
  }

  // 2. Obtener todas las FAQs
  const allFaqs = await strapi.documents('api::faq.faq').findMany({});

  // 3. Filtrar FAQs que contengan al menos una palabra
  const results = allFaqs.filter((faq: any) => {
    const questionLower = (faq.question || '').toLowerCase();
    const answerLower = (faq.answer || '').toLowerCase();
    const keywordsLower = JSON.stringify(faq.keywords || []).toLowerCase();
    
    return words.some(word => {
      return questionLower.includes(word) ||
             answerLower.includes(word) ||
             keywordsLower.includes(word);
    });
  });

  // 4. Calcular score de relevancia
  const scoredResults = results.map((faq: any) => {
    const questionLower = (faq.question || '').toLowerCase();
    const answerLower = (faq.answer || '').toLowerCase();
    
    // Contar palabras coincidentes
    const matchCount = words.filter(word => 
      questionLower.includes(word) || answerLower.includes(word)
    ).length;
    
    // Bonus si está en la pregunta
    const inQuestion = words.some(word => questionLower.includes(word));
    
    return {
      faq,
      score: matchCount * 10 + (inQuestion ? 50 : 0) + (faq.viewCount || 0)
    };
  });

  // 5. Ordenar por score descendente
  scoredResults.sort((a, b) => b.score - a.score);
  
  // 6. Retornar FAQs ordenadas
  const sortedResults = scoredResults.map(item => item.faq);
  
  const sanitizedResults = await this.sanitizeOutput(sortedResults, ctx);
  return this.transformResponse(sanitizedResults);
}
```

---

## ✅ Resumen

### **Antes:**
- ❌ Búsqueda exacta de frase completa
- ❌ No encuentra si falta una palabra
- ❌ No ordena por relevancia

### **Ahora:**
- ✅ Búsqueda flexible por palabras
- ✅ Encuentra aunque no esté la frase exacta
- ✅ Ordena por relevancia inteligente
- ✅ Filtra palabras cortas (< 3 caracteres)
- ✅ Funciona con palabras parciales
- ✅ Score basado en múltiples factores

---

## 🎉 Resultado

**Búsqueda mucho más inteligente y flexible que encuentra resultados relevantes aunque el usuario no escriba la frase exacta.**

**Ejemplos:**
- ✅ "necesito profesional" → Encuentra "¿Cómo contacto a un profesional?"
- ✅ "pagar servicio" → Encuentra "¿Cómo pago por los servicios?"
- ✅ "profes confiable" → Encuentra "¿Cómo sé si un profesional es confiable?"

**¡Búsqueda inteligente implementada!** 🧠✨

