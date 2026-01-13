# 👍👎 Sistema de Feedback de FAQs

## 📋 Descripción

Sistema completo de feedback para FAQs que permite:
- **Incrementar vistas** cuando un usuario expande una FAQ
- **Marcar como útil** (👍) o **no útil** (👎)
- **Tracking de analytics** de interacciones

---

## 🔧 Configuración Implementada

### **Backend**

#### **1. Schema (content-types/faq/schema.json)**

Los campos de feedback ya están en el schema:

```json
{
  "viewCount": {
    "type": "integer",
    "default": 0
  },
  "helpfulCount": {
    "type": "integer",
    "default": 0
  },
  "notHelpfulCount": {
    "type": "integer",
    "default": 0
  }
}
```

#### **2. Controlador (controllers/faq.ts)**

**Método `incrementView`** - Incrementa contador de vistas:
```typescript
async incrementView(ctx) {
  const { id } = ctx.params;
  const faq = await strapi.documents('api::faq.faq').findOne({
    documentId: id,
  });
  
  const updatedFaq = await strapi.documents('api::faq.faq').update({
    documentId: id,
    data: { viewCount: (faq.viewCount || 0) + 1 },
  });
  
  return { viewCount: updatedFaq.viewCount || 0 };
}
```

**Método `markHelpful`** - Marca como útil/no útil:
```typescript
async markHelpful(ctx) {
  const { id } = ctx.params;
  const { helpful } = ctx.request.body;
  
  const faq = await strapi.documents('api::faq.faq').findOne({
    documentId: id,
  });
  
  const updatedFaq = await strapi.documents('api::faq.faq').update({
    documentId: id,
    data: helpful
      ? { helpfulCount: (faq.helpfulCount || 0) + 1 }
      : { notHelpfulCount: (faq.notHelpfulCount || 0) + 1 },
  });
  
  return {
    data: {
      helpfulCount: updatedFaq.helpfulCount || 0,
      notHelpfulCount: updatedFaq.notHelpfulCount || 0,
    }
  };
}
```

#### **3. Rutas (routes/custom-faq.ts)**

```typescript
{
  method: 'PUT',
  path: '/faqs/:id/view',
  handler: 'faq.incrementView',
  config: { auth: false }, // Acceso público
},
{
  method: 'POST',
  path: '/faqs/:id/helpful',
  handler: 'faq.markHelpful',
  config: { auth: false }, // Acceso público
}
```

---

### **Frontend**

#### **1. Servicio (core/services/faq.service.ts)**

```typescript
incrementView(id: number | string): Observable<{ viewCount: number }> {
  return this.http.put<{ viewCount: number }>(
    `${this.getApiUrl()}/faqs/${id}/view`,
    {},
    { headers: this.getHeaders() }
  ).pipe(
    map(response => ({ viewCount: response.viewCount || 0 })),
    catchError(error => {
      console.error('Error al incrementar vistas:', error);
      return of({ viewCount: 0 });
    })
  );
}

markHelpful(id: number | string, helpful: boolean): Observable<{ helpfulCount: number; notHelpfulCount: number }> {
  return this.http.post<{
    data: { helpfulCount: number; notHelpfulCount: number };
  }>(
    `${this.getApiUrl()}/faqs/${id}/helpful`,
    { helpful },
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data || { helpfulCount: 0, notHelpfulCount: 0 }),
    catchError(error => {
      console.error('Error al marcar FAQ:', error);
      return of({ helpfulCount: 0, notHelpfulCount: 0 });
    })
  );
}
```

#### **2. Componente (features/support/help.component.ts)**

**Al expandir FAQ (incrementar vistas):**
```typescript
toggleFaq(index: number, faq: Faq): void {
  const wasExpanded = this.expandedIndex === index;
  this.expandedIndex = this.expandedIndex === index ? null : index;
  
  // Priorizar documentId sobre id para Strapi 5
  const faqId = faq.documentId || faq.id;
  if (!wasExpanded && faqId) {
    this.faqService.incrementView(faqId).subscribe({
      next: (result) => {
        faq.viewCount = result.viewCount;
      }
    });
  }
}
```

**Al hacer clic en útil/no útil:**
```typescript
markAsHelpful(faq: Faq, helpful: boolean, event: Event): void {
  event.stopPropagation();
  
  const faqId = faq.documentId || faq.id;
  if (!faqId) return;

  this.faqService.markHelpful(faqId, helpful).subscribe({
    next: (result) => {
      faq.helpfulCount = result.helpfulCount;
      faq.notHelpfulCount = result.notHelpfulCount;
      
      // Track evento en analytics
      this.analytics.trackEvent('FAQ', helpful ? 'Helpful' : 'Not Helpful', faq.question);
    }
  });
}
```

#### **3. Template (features/support/help.component.html)**

```html
<div class="faq-feedback">
  <p class="feedback-question">¿Te resultó útil esta respuesta?</p>
  <div class="feedback-buttons">
    <button 
      class="feedback-btn"
      (click)="markAsHelpful(faq, true, $event)"
      [disabled]="!faq.documentId && !faq.id"
    >
      <mat-icon>thumb_up</mat-icon>
      Sí
      <span *ngIf="faq.helpfulCount && faq.helpfulCount > 0">
        ({{ faq.helpfulCount }})
      </span>
    </button>
    <button 
      class="feedback-btn"
      (click)="markAsHelpful(faq, false, $event)"
      [disabled]="!faq.documentId && !faq.id"
    >
      <mat-icon>thumb_down</mat-icon>
      No
      <span *ngIf="faq.notHelpfulCount && faq.notHelpfulCount > 0">
        ({{ faq.notHelpfulCount }})
      </span>
    </button>
  </div>
</div>
```

---

## 🔌 Endpoints del API

### **1. Incrementar vistas**

```http
PUT /api/faqs/:documentId/view
```

**Respuesta:**
```json
{
  "viewCount": 5
}
```

### **2. Marcar como útil/no útil**

```http
POST /api/faqs/:documentId/helpful
Content-Type: application/json

{
  "helpful": true
}
```

**Respuesta:**
```json
{
  "data": {
    "helpfulCount": 10,
    "notHelpfulCount": 2
  }
}
```

---

## 🧪 Probar la Funcionalidad

### **Opción 1: Script automático**

```bash
node test-faq-feedback.js
```

Este script:
- ✅ Obtiene todas las FAQs
- ✅ Incrementa vistas 3 veces
- ✅ Marca como útil 2 veces
- ✅ Marca como no útil 1 vez
- ✅ Verifica los contadores

### **Opción 2: Manualmente en el navegador**

1. **Inicia el backend:**
   ```bash
   npm run develop
   ```

2. **Inicia el frontend:**
   ```bash
   cd ../frontend
   npm start
   ```

3. **Navega a:**
   ```
   http://localhost:4200/help
   ```

4. **Interactúa:**
   - Expande una FAQ → Se incrementa `viewCount`
   - Haz clic en "Sí" → Se incrementa `helpfulCount`
   - Haz clic en "No" → Se incrementa `notHelpfulCount`

5. **Verifica en Strapi Admin:**
   ```
   http://localhost:1338/admin/content-manager/collection-types/api::faq.faq
   ```
   - Verás los contadores actualizados en tiempo real

### **Opción 3: Con Postman/Curl**

**Incrementar vistas:**
```bash
curl -X PUT http://localhost:1338/api/faqs/{documentId}/view
```

**Marcar como útil:**
```bash
curl -X POST http://localhost:1338/api/faqs/{documentId}/helpful \
  -H "Content-Type: application/json" \
  -d '{"helpful": true}'
```

**Marcar como no útil:**
```bash
curl -X POST http://localhost:1338/api/faqs/{documentId}/helpful \
  -H "Content-Type: application/json" \
  -d '{"helpful": false}'
```

---

## 📊 Analytics

El sistema integra con el `AnalyticsService` para trackear:

```typescript
this.analytics.trackEvent(
  'FAQ',                                // Categoría
  helpful ? 'Helpful' : 'Not Helpful',  // Acción
  faq.question                          // Label (pregunta de la FAQ)
);
```

Esto permite:
- Ver qué FAQs son más útiles
- Identificar FAQs que necesitan mejoras
- Analizar patrones de uso

---

## 🔑 Puntos Importantes

### **1. Uso de `documentId` vs `id`**

En **Strapi 5**, el identificador principal es `documentId` (string):
- ✅ **Usar:** `faq.documentId || faq.id`
- ❌ **No usar:** Solo `faq.id`

### **2. Acceso público**

Ambos endpoints tienen `auth: false` porque:
- Los usuarios no autenticados deben poder dar feedback
- No se requiere login para ver FAQs

### **3. Stop Propagation**

```typescript
markAsHelpful(faq: Faq, helpful: boolean, event: Event): void {
  event.stopPropagation(); // ⚠️ Importante
  // ...
}
```

Esto evita que al hacer clic en los botones se expanda/colapse el accordion.

### **4. Formato de respuesta**

Backend retorna formato específico que el frontend espera:

**incrementView:**
```json
{ "viewCount": 5 }
```

**markHelpful:**
```json
{
  "data": {
    "helpfulCount": 10,
    "notHelpfulCount": 2
  }
}
```

---

## ✅ Checklist de Verificación

- ✅ Schema tiene campos `viewCount`, `helpfulCount`, `notHelpfulCount`
- ✅ Controlador implementa `incrementView` y `markHelpful`
- ✅ Rutas configuradas con acceso público
- ✅ Servicio frontend implementa métodos
- ✅ Componente llama servicios correctamente
- ✅ Template muestra botones y contadores
- ✅ Analytics trackea interacciones
- ✅ Script de prueba funciona

---

## 🚀 Resultado

Ahora tienes un sistema completo de feedback para FAQs que:
- 📊 Trackea vistas automáticamente
- 👍 Permite a usuarios marcar FAQs como útiles
- 👎 Permite a usuarios marcar FAQs como no útiles
- 📈 Muestra contadores en tiempo real
- 🔍 Integra con analytics para análisis

**¡Todo listo para producción!** 🎉

