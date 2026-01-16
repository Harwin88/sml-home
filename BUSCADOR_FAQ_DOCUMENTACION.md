# 🔍 Buscador de FAQs - Documentación

## 📋 Descripción

Sistema de búsqueda en tiempo real para FAQs que permite a los usuarios encontrar respuestas rápidamente mediante búsqueda por coincidencia parcial (LIKE) en preguntas, respuestas y keywords.

---

## ✅ Funcionalidad Implementada

### **Características:**
1. ✅ **Búsqueda en tiempo real** con debouncing (400ms)
2. ✅ **Búsqueda por coincidencia** (LIKE %término%)
3. ✅ **Busca en múltiples campos**: question, answer, keywords
4. ✅ **Validación de mínimo 3 caracteres**
5. ✅ **Indicador de carga** (spinner) mientras busca
6. ✅ **Mensaje informativo** cuando escribe menos de 3 caracteres
7. ✅ **Contador de resultados** en tiempo real
8. ✅ **Botón para limpiar** búsqueda
9. ✅ **Analytics** integrado

---

## 🔧 Cómo Funciona

### **Backend (Strapi 5)**

#### **Endpoint de Búsqueda:**
```
GET /api/faqs/search?q=término
```

#### **Controlador (`controllers/faq.ts`):**
```typescript
async search(ctx) {
  const { q } = ctx.query;

  // Validación: mínimo 3 caracteres
  if (!q || q.length < 3) {
    return ctx.badRequest('Search term must be at least 3 characters');
  }

  const searchTerm = q.toLowerCase();

  // Búsqueda con LIKE (%término%) en 3 campos
  const results = await strapi.documents('api::faq.faq').findMany({
    filters: {
      $or: [
        { question: { $containsi: searchTerm } },  // LIKE %término%
        { answer: { $containsi: searchTerm } },    // LIKE %término%
        { keywords: { $containsi: searchTerm } },  // LIKE %término%
      ],
    },
    sort: { viewCount: 'desc' }, // Ordenar por más vistas
  });

  return this.transformResponse(results);
}
```

**`$containsi`** = **LIKE %término%** (case insensitive)

#### **Ruta (`routes/custom-faq.ts`):**
```typescript
{
  method: 'GET',
  path: '/faqs/search',
  handler: 'faq.search',
  config: {
    auth: false, // Acceso público
  },
}
```

---

### **Frontend (Angular)**

#### **Servicio (`faq.service.ts`):**

Ya existe el método `searchFaqs()`:

```typescript
searchFaqs(query: string): Observable<Faq[]> {
  if (!query || query.length < 3) {
    return of([]);
  }

  return this.http.get<FaqSearchResponse>(
    `${this.getApiUrl()}/faqs/search`,
    { 
      params: { q: query },
      headers: this.getHeaders()
    }
  ).pipe(
    map(response => response.data || []),
    catchError(error => {
      console.error('Error al buscar FAQs:', error);
      return of([]);
    })
  );
}
```

#### **Componente (`help.component.ts`):**

**Propiedades:**
```typescript
searchQuery: string = '';              // Término de búsqueda
isSearching = false;                   // Estado de carga
searchResults: Faq[] = [];             // Resultados de búsqueda
private searchSubject = new Subject<string>(); // Subject para debouncing
```

**Configuración del debounce:**
```typescript
private setupSearch(): void {
  this.searchSubject.pipe(
    debounceTime(400),          // Esperar 400ms sin cambios
    distinctUntilChanged(),     // Solo si el término cambió
    switchMap(query => {
      if (!query || query.trim().length < 3) {
        this.isSearching = false;
        this.searchResults = [];
        return [];
      }
      
      this.isSearching = true;
      return this.faqService.searchFaqs(query.trim());
    })
  ).subscribe({
    next: (results) => {
      this.searchResults = results;
      this.isSearching = false;
      
      // Track búsqueda en analytics
      if (this.searchQuery.trim().length >= 3) {
        this.analytics.trackEvent('FAQ', 'Search', this.searchQuery);
      }
    },
    error: (error) => {
      console.error('Error al buscar FAQs:', error);
      this.isSearching = false;
      this.searchResults = [];
    }
  });
}
```

**Métodos:**
```typescript
// Manejar cambio en el input
onSearchChange(query: string): void {
  this.searchQuery = query;
  this.searchSubject.next(query);
}

// Limpiar búsqueda
clearSearch(): void {
  this.searchQuery = '';
  this.searchResults = [];
  this.isSearching = false;
  this.searchSubject.next('');
}

// Verificar si está en modo búsqueda
get isInSearchMode(): boolean {
  return this.searchQuery.trim().length >= 3;
}

// FAQs filtradas (usa resultados de búsqueda si está buscando)
get filteredFaqs(): Faq[] {
  if (this.isInSearchMode) {
    return this.searchResults; // Mostrar resultados de búsqueda
  }
  
  // Si no, filtrar por categoría
  if (this.selectedCategory === 'all') {
    return this.faqs;
  }
  return this.faqs.filter(faq => faq.category === this.selectedCategory);
}
```

---

## 🎨 UI/UX

### **Barra de Búsqueda:**

```html
<div class="search-container">
  <!-- Icono de búsqueda -->
  <mat-icon class="search-icon">search</mat-icon>
  
  <!-- Input de búsqueda -->
  <input
    type="text"
    class="search-input"
    placeholder="Busca tu pregunta aquí... (ej: pago, servicio, cuenta)"
    [(ngModel)]="searchQuery"
    (input)="onSearchChange(searchQuery)"
  />
  
  <!-- Botón para limpiar (solo si hay texto) -->
  <button
    *ngIf="searchQuery.length > 0"
    class="clear-search-btn"
    (click)="clearSearch()"
  >
    <mat-icon>close</mat-icon>
  </button>
  
  <!-- Spinner (solo mientras busca) -->
  <div class="search-spinner" *ngIf="isSearching">
    <mat-icon class="spinner-icon">autorenew</mat-icon>
  </div>
</div>
```

### **Estados del Buscador:**

#### **1. Estado Inicial (vacío):**
```
┌────────────────────────────────────────────────────┐
│ 🔍 Busca tu pregunta aquí... (ej: pago, servicio) │
└────────────────────────────────────────────────────┘
```

#### **2. Escribiendo < 3 caracteres:**
```
┌────────────────────────────────────────────────────┐
│ 🔍 pa                                          [×] │
└────────────────────────────────────────────────────┘
ℹ️ Escribe al menos 3 caracteres para buscar
```

#### **3. Buscando (con spinner):**
```
┌────────────────────────────────────────────────────┐
│ 🔍 pago                                    [×] [⟳] │
└────────────────────────────────────────────────────┘
```

#### **4. Resultados encontrados:**
```
┌────────────────────────────────────────────────────┐
│ 🔍 pago                                        [×] │
└────────────────────────────────────────────────────┘
✅ Se encontraron 4 resultado(s) para "pago"

Resultados de Búsqueda                    4 pregunta(s)

 ▼ ¿Cómo pago por los servicios?
   El pago se realiza directamente...
   
 ▼ ¿Puedo solicitar factura?
   Sí, puedes solicitar factura...
```

#### **5. Sin resultados:**
```
┌────────────────────────────────────────────────────┐
│ 🔍 xyz123                                      [×] │
└────────────────────────────────────────────────────┘
🔍 No se encontraron resultados para "xyz123"

      🔍
  No se encontraron resultados para "xyz123"
  Intenta con otros términos de búsqueda
  
  [ ← Ver todas las FAQs ]
```

---

## 📊 Flujo de Búsqueda

```
1. Usuario escribe en el input
   ↓
2. onSearchChange(query)
   ↓
3. searchSubject.next(query)
   ↓
4. debounceTime(400ms) - Espera 400ms sin cambios
   ↓
5. distinctUntilChanged() - Solo si cambió
   ↓
6. Validación: ¿query >= 3 caracteres?
   ↓ No → Limpiar resultados
   ↓ Sí
7. isSearching = true (mostrar spinner)
   ↓
8. faqService.searchFaqs(query)
   ↓
9. HTTP GET /api/faqs/search?q=query
   ↓
10. Backend: Busca con LIKE en 3 campos
   ↓
11. Backend: Retorna resultados ordenados por viewCount
   ↓
12. Frontend: searchResults = results
   ↓
13. isSearching = false (ocultar spinner)
   ↓
14. Analytics: trackEvent('FAQ', 'Search', query)
   ↓
15. UI: Muestra resultados automáticamente
```

---

## 🎯 Ventajas del Debouncing

### **Sin Debouncing:**
```
Usuario escribe: "pago"

p     → Petición HTTP (1 letra)
pa    → Petición HTTP (2 letras)
pag   → Petición HTTP (3 letras) ✓
pago  → Petición HTTP (4 letras) ✓

Total: 4 peticiones (2 inútiles)
```

### **Con Debouncing (400ms):**
```
Usuario escribe: "pago"

p     → Espera...
pa    → Espera...
pag   → Espera...
pago  → Espera 400ms → Petición HTTP ✓

Total: 1 petición (eficiente)
```

**Beneficios:**
- ✅ Menos carga en el servidor
- ✅ Mejor performance
- ✅ Mejor UX (no parpadea)
- ✅ Ahorro de ancho de banda

---

## 🔒 Validaciones

### **Frontend:**
1. **Mínimo 3 caracteres:**
   - Muestra mensaje informativo si < 3
   - No hace petición hasta tener >= 3

2. **Trim del término:**
   - Elimina espacios al inicio y final
   - `query.trim()`

3. **Debouncing:**
   - Espera 400ms sin cambios
   - Cancela peticiones anteriores

### **Backend:**
1. **Mínimo 3 caracteres:**
   ```typescript
   if (!q || q.length < 3) {
     return ctx.badRequest('Search term must be at least 3 characters');
   }
   ```

2. **Case insensitive:**
   - `$containsi` ignora mayúsculas/minúsculas

---

## 🧪 Ejemplos de Búsqueda

### **Ejemplo 1: Buscar "pago"**

**Encuentra:**
- ❓ "¿Cómo **pago** por los servicios?"
- ❓ "¿Hay costos adicionales en el **pago**?"
- ❓ "Métodos de **pago** aceptados"

**Request:**
```
GET /api/faqs/search?q=pago
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "question": "¿Cómo pago por los servicios?",
      "answer": "El pago se realiza directamente...",
      "category": "payments",
      "viewCount": 45,
      "helpfulCount": 12,
      "notHelpfulCount": 1
    },
    // ... más resultados
  ]
}
```

---

### **Ejemplo 2: Buscar "cuenta"**

**Encuentra:**
- ❓ "¿Necesito crear una **cuenta**?"
- ❓ "¿Cómo edito mi **cuenta**?"
- ❓ "¿Puedo eliminar mi **cuenta**?"

---

### **Ejemplo 3: Buscar "segur"**

**Encuentra:**
- ❓ "¿Cómo garantizan la **segur**idad?"
- ❓ "¿Qué es el **Segur**o de Garantía?"
- ❓ "Medidas de **segur**idad"

**Nota:** Busca coincidencias parciales, no necesita la palabra completa.

---

## 📱 Responsive

El buscador es **completamente responsive**:

**Desktop:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Busca tu pregunta aquí... (ej: pago, servicio)      [×] │
└─────────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌────────────────────────────────┐
│ 🔍 Busca aquí...          [×] │
└────────────────────────────────┘
```

---

## 🎨 Estilos CSS

### **Input con focus:**
```scss
.search-container {
  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    background: white;
  }
}
```

### **Spinner animado:**
```scss
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner-icon {
  animation: spin 1s linear infinite;
}
```

### **Mensaje de resultados:**
```scss
.search-results-info {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 1px solid #4caf50;
  // ... estilos
}
```

---

## 📊 Analytics

Cada búsqueda se trackea automáticamente:

```typescript
this.analytics.trackEvent(
  'FAQ',              // Categoría
  'Search',           // Acción
  this.searchQuery    // Label (término buscado)
);
```

**Métricas que puedes analizar:**
- ✅ Términos más buscados
- ✅ Búsquedas sin resultados
- ✅ Patrones de búsqueda de usuarios

---

## 🔄 Integración con Categorías

El buscador se integra perfectamente con las categorías:

1. **Al buscar:**
   - Oculta las categorías
   - Muestra resultados de búsqueda

2. **Al seleccionar categoría:**
   - Limpia la búsqueda automáticamente
   - Muestra FAQs de esa categoría

3. **Al limpiar búsqueda:**
   - Restaura vista de categorías
   - Vuelve a mostrar todas las FAQs

---

## 🧪 Cómo Probar

### **1. Prueba Básica:**
```bash
# 1. Iniciar frontend
cd frontend
npm start

# 2. Abrir navegador
http://localhost:4200/help

# 3. Buscar "pago"
# 4. Verificar que muestra resultados
```

### **2. Prueba de Validación:**
```
1. Escribe "pa" (2 caracteres)
   ✅ Debe mostrar: "Escribe al menos 3 caracteres"
   
2. Escribe "pag" (3 caracteres)
   ✅ Debe iniciar búsqueda con spinner
   
3. Espera 400ms
   ✅ Debe mostrar resultados
```

### **3. Prueba de Debouncing:**
```
1. Escribe rápidamente: "p-a-g-o"
   ✅ Solo debe hacer 1 petición al final
   
2. Verifica en DevTools (F12) → Network
   ✅ Solo 1 request a /api/faqs/search?q=pago
```

### **4. Prueba de Limpiar:**
```
1. Busca "pago"
2. Haz clic en [×]
   ✅ Input se limpia
   ✅ Resultados desaparecen
   ✅ Vuelven las categorías
```

### **5. Prueba Sin Resultados:**
```
1. Busca "xyz123456789"
   ✅ Debe mostrar: "No se encontraron resultados"
   ✅ Botón "Ver todas las FAQs" aparece
```

---

## 📁 Archivos Modificados

```
frontend/src/app/features/support/
├── help.component.ts         ✅ Lógica de búsqueda
├── help.component.html       ✅ UI del buscador
└── support.component.scss    ✅ Estilos
```

---

## 🎉 Resultado Final

**Sistema de búsqueda completo con:**

1. ✅ Búsqueda en tiempo real
2. ✅ Debouncing inteligente (400ms)
3. ✅ Búsqueda por coincidencia (LIKE)
4. ✅ Busca en 3 campos (question, answer, keywords)
5. ✅ Validación de 3 caracteres mínimo
6. ✅ Indicador de carga (spinner)
7. ✅ Mensajes informativos
8. ✅ Contador de resultados
9. ✅ Botón de limpiar
10. ✅ Analytics integrado
11. ✅ Integración con categorías
12. ✅ UI moderna y responsive
13. ✅ Sin errores de linting

---

**¡Buscador de FAQs 100% funcional!** 🎊

