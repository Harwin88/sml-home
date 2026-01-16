# 🔗 Integración Frontend-Backend - MSL Hogar

## 📋 Resumen

El frontend ahora está completamente integrado con el backend de Strapi para:
- ✅ Envío de formularios de contacto
- ✅ Gestión de preguntas frecuentes (FAQs)
- ✅ Sistema de tickets de soporte (preparado para futuro)

---

## 🛠️ Servicios Actualizados

### 1. **ContactService** (`core/services/contact.service.ts`)

**Cambios realizados:**
- ✅ Extendido de `StrapiBaseService` para heredar autenticación y headers
- ✅ Método `submitContactForm()` ahora envía al endpoint real `/api/contact-forms`
- ✅ Manejo de respuestas exitosas con `ticketId`
- ✅ Manejo de errores con mensajes específicos del backend
- ✅ Uso automático del token de API configurado en `config.json`

**Endpoint utilizado:**
```typescript
POST /api/contact-forms
```

**Request Body:**
```json
{
  "data": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "3001234567",
    "contactType": "general",
    "subject": "Consulta sobre servicios",
    "message": "Me gustaría saber más...",
    "acceptTerms": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tu mensaje ha sido enviado exitosamente...",
  "ticketId": "MSL-1234567890-1234",
  "data": { ... }
}
```

---

### 2. **FaqService** (NUEVO) (`core/services/faq.service.ts`)

**Servicio completamente nuevo para gestionar FAQs desde Strapi.**

#### Métodos Disponibles:

##### **Públicos (sin autenticación):**

1. **`getAllFaqs(params?: QueryParams)`**
   - Obtiene todas las FAQs publicadas
   - Endpoint: `GET /api/faqs`
   - Soporta filtros, ordenamiento y paginación

2. **`getFaqById(id: number)`**
   - Obtiene una FAQ específica por ID
   - Endpoint: `GET /api/faqs/:id`

3. **`getFaqsByCategory(category: FaqCategory)`**
   - Obtiene FAQs de una categoría específica
   - Endpoint: `GET /api/faqs/category/:category`
   - Categorías: `general`, `search`, `payments`, `security`, `account`, `providers`, `technical`

4. **`getPopularFaqs()`**
   - Obtiene las FAQs más populares (top 10)
   - Endpoint: `GET /api/faqs/popular`

5. **`searchFaqs(query: string)`**
   - Busca FAQs por texto (mínimo 3 caracteres)
   - Endpoint: `GET /api/faqs/search?q=query`

6. **`incrementView(id: number)`**
   - Incrementa el contador de vistas de una FAQ
   - Endpoint: `POST /api/faqs/:id/view`
   - Se llama automáticamente al expandir una FAQ

7. **`markHelpful(id: number, helpful: boolean)`**
   - Marca una FAQ como útil o no útil
   - Endpoint: `POST /api/faqs/:id/helpful`

##### **Admin (requieren autenticación):**

8. **`createFaq(faqData)`**
   - Crea una nueva FAQ
   - Endpoint: `POST /api/faqs`

9. **`updateFaq(id, faqData)`**
   - Actualiza una FAQ existente
   - Endpoint: `PUT /api/faqs/:id`

10. **`deleteFaq(id)`**
    - Elimina una FAQ
    - Endpoint: `DELETE /api/faqs/:id`

11. **`getStats()`**
    - Obtiene estadísticas de FAQs
    - Endpoint: `GET /api/faqs/stats`

---

## 📱 Componentes Actualizados

### 1. **HelpComponent** (`features/support/help.component.ts`)

**Cambios principales:**

#### a) Carga Dinámica de FAQs
```typescript
ngOnInit(): void {
  this.loadFaqs(); // Carga desde el backend
}

loadFaqs(): void {
  this.faqService.getAllFaqs({
    sort: ['order:asc', 'createdAt:desc'],
    populate: ['relatedFaqs']
  }).subscribe({
    next: (faqs) => {
      this.faqs = faqs;
      this.loading = false;
    },
    error: (error) => {
      this.loadFallbackFaqs(); // FAQs hardcoded como respaldo
    }
  });
}
```

#### b) Filtrado por Categoría
```typescript
selectCategory(category: string): void {
  if (category !== 'all') {
    this.faqService.getFaqsByCategory(category as FaqCategory).subscribe({
      next: (faqs) => {
        this.faqs = faqs;
      }
    });
  }
}
```

#### c) Tracking de Vistas
```typescript
toggleFaq(index: number, faq: Faq): void {
  const wasExpanded = this.expandedIndex === index;
  this.expandedIndex = wasExpanded ? null : index;
  
  if (!wasExpanded && faq.id) {
    this.faqService.incrementView(faq.id).subscribe();
  }
}
```

#### d) Sistema de Feedback
```typescript
markAsHelpful(faq: Faq, helpful: boolean): void {
  this.faqService.markHelpful(faq.id, helpful).subscribe({
    next: (result) => {
      faq.helpfulCount = result.helpfulCount;
      faq.notHelpfulCount = result.notHelpfulCount;
    }
  });
}
```

**Nuevas características en el template:**
- ✅ Estado de carga (loading spinner)
- ✅ Estado de error con botón de reintentar
- ✅ Estado vacío (no FAQs encontradas)
- ✅ Botones de feedback (👍 útil / 👎 no útil)
- ✅ Contador de vistas y feedback visible

---

### 2. **ContactComponent** (`features/support/contact.component.ts`)

**Cambios principales:**

#### a) Envío al Backend Real
El formulario ahora envía directamente al backend en lugar de simular.

#### b) Display de Ticket ID
```typescript
onSubmit(): void {
  this.contactService.submitContactForm(this.contactForm.value).subscribe({
    next: (response) => {
      this.successMessage = response.message;
      this.ticketId = response.ticketId || '';
      this.showSuccessMessage = true;
    }
  });
}
```

#### c) Mensajes Personalizados
- Mensaje de éxito del backend
- Ticket ID destacado
- Mensaje de error específico del backend

---

## 🔐 Autenticación y Configuración

### **API Token**

El token de Strapi ya está configurado en `src/assets/config.json`:

```json
{
  "apiUrl": "http://localhost:1338",
  "strapiKey": "7f944e4deeb9de79400b421a..."
}
```

### **StrapiBaseService**

Todos los servicios extienden de `StrapiBaseService` que:
- ✅ Agrega automáticamente el header `Authorization: Bearer {token}`
- ✅ Construye las URLs correctas con la base URL configurada
- ✅ Maneja parámetros de query (filtros, sort, populate, pagination)
- ✅ Proporciona métodos genéricos (GET, POST, PUT, DELETE)

---

## 🎨 Mejoras en UI/UX

### **Estados de Carga**

#### Loading State
```html
<div class="loading-container">
  <mat-icon class="loading-spinner">autorenew</mat-icon>
  <p>Cargando preguntas frecuentes...</p>
</div>
```

#### Error State
```html
<div class="error-container">
  <mat-icon>error_outline</mat-icon>
  <h3>{{ error }}</h3>
  <button (click)="loadFaqs()">Reintentar</button>
</div>
```

#### Empty State
```html
<div class="empty-state">
  <mat-icon>search_off</mat-icon>
  <h3>No se encontraron preguntas frecuentes</h3>
</div>
```

### **Mensajes Mejorados**

#### Success Message (Contact Form)
- ✅ Mensaje personalizado del backend
- ✅ Ticket ID destacado en caja
- ✅ Texto informativo para guardar el ticket
- ✅ Auto-cierre después de 8 segundos

#### Error Message (Contact Form)
- ✅ Mensaje de error específico del backend
- ✅ Estilo visual claro (rojo)
- ✅ Auto-cierre después de 10 segundos

---

## 🧪 Cómo Probar

### **1. Asegúrate de que el Backend esté corriendo**

```bash
cd backend
npm run develop
```

Backend debería estar en: `http://localhost:1337`

### **2. Inicia el Frontend**

```bash
cd frontend
npm start
```

Frontend debería estar en: `http://localhost:4200`

### **3. Probar Formulario de Contacto**

1. Ve a: `http://localhost:4200/contact`
2. Completa el formulario
3. Envía
4. Deberías ver:
   - ✅ Mensaje de éxito del backend
   - ✅ Ticket ID generado (ej: `MSL-1234567890-1234`)
   - ✅ Mensaje guardado en Strapi (visible en admin panel)

### **4. Probar FAQs**

**Opción A: Sin FAQs en el backend**
- Ve a: `http://localhost:4200/help`
- Deberías ver FAQs hardcoded (fallback)
- Funcionarán normalmente pero sin guardar vistas/feedback

**Opción B: Con FAQs del backend**
1. Ejecuta el seed en el backend:
   ```bash
   cd backend
   npm run strapi console
   # En la consola:
   await require('./src/scripts/seed-faqs').default()
   ```

2. Ve a: `http://localhost:4200/help`
3. Deberías ver las FAQs del backend
4. Al expandir una FAQ, se incrementa el contador de vistas
5. Puedes marcar como útil/no útil

---

## 🔄 Flujo de Datos

### **Formulario de Contacto**

```
ContactComponent 
  → ContactService.submitContactForm()
    → HTTP POST /api/contact-forms (con token)
      → Backend Strapi
        → Guarda en BD
        → Genera Ticket ID
        → (Opcional) Crea Support Ticket
        → (Opcional) Envía Emails
      ← Response con ticketId
    ← Observable<ContactResponse>
  ← Muestra mensaje de éxito con ticketId
```

### **FAQs**

```
HelpComponent.ngOnInit()
  → FaqService.getAllFaqs()
    → HTTP GET /api/faqs (con token)
      → Backend Strapi
        → Consulta BD
        → Filtra publicadas
        → Ordena por order/createdAt
      ← FAQs[]
    ← Observable<Faq[]>
  ← this.faqs = faqs (renderiza en template)
```

### **Expandir FAQ**

```
Usuario expande FAQ
  → HelpComponent.toggleFaq(index, faq)
    → FaqService.incrementView(faq.id)
      → HTTP POST /api/faqs/:id/view
        → Backend incrementa viewCount
      ← { viewCount: 15 }
    ← Observable actualiza viewCount local
  ← FAQ expandida con contador actualizado
```

---

## 📊 Métricas y Analytics

Todas las interacciones se rastrean con `AnalyticsService`:

### **Formulario de Contacto:**
```typescript
// Envío exitoso
this.analytics.trackFormSubmit('contact', true);
this.analytics.trackEvent('Contact Form', 'Submit', contactType);

// Error
this.analytics.trackFormSubmit('contact', false);
this.analytics.trackEvent('Contact Form', 'Error', errorMessage);
```

### **FAQs:**
```typescript
// Page view
this.analytics.trackPageView('/help', 'Centro de Ayuda');

// Feedback
this.analytics.trackEvent('FAQ', 'Helpful', faq.question);
this.analytics.trackEvent('FAQ', 'Not Helpful', faq.question);
```

---

## 🐛 Troubleshooting

### **Error: No se cargan las FAQs**

**Síntomas:** Loading infinito o error

**Posibles causas:**
1. Backend no está corriendo → Iniciar backend
2. URL incorrecta en `config.json` → Verificar `apiUrl`
3. Token inválido → Verificar `strapiKey` en config
4. No hay FAQs publicadas → Ejecutar seed o crear FAQs manualmente

**Solución:** El componente tiene fallback a FAQs hardcoded

### **Error: Formulario no se envía**

**Síntomas:** Error al enviar, sin mensaje de éxito

**Posibles causas:**
1. Backend no está corriendo
2. Endpoint `/api/contact-forms` no existe
3. Permisos no configurados (debe ser público)
4. Rate limit excedido (máx 5 por hora)

**Verificar:**
```bash
# Probar el endpoint directamente
curl -X POST http://localhost:1337/api/contact-forms \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Test","email":"test@test.com",...}}'
```

### **Error: 401 Unauthorized**

**Causa:** Token de API inválido o expirado

**Solución:**
1. Ve al admin panel de Strapi
2. Settings > API Tokens
3. Regenera el token si es necesario
4. Actualiza `config.json` con el nuevo token

---

## ✅ Checklist de Integración

- [x] ContactService actualizado para usar API real
- [x] FaqService creado con todos los métodos
- [x] HelpComponent actualizado para cargar FAQs del backend
- [x] ContactComponent actualizado para mostrar ticketId
- [x] Estados de carga/error/vacío implementados
- [x] Sistema de feedback de FAQs implementado
- [x] Tracking de analytics integrado
- [x] Fallback a FAQs hardcoded si backend no disponible
- [x] Mensajes de error personalizados del backend
- [x] Token de API configurado y funcionando
- [x] Sin errores de linting

---

## 🚀 Próximos Pasos

1. **Testing en producción**
   - Actualizar `config.json` con URL de producción
   - Verificar que el token de producción esté configurado

2. **Optimizaciones opcionales**
   - Implementar caché de FAQs en localStorage
   - Agregar lazy loading para muchas FAQs
   - Implementar búsqueda en tiempo real de FAQs

3. **Features futuros**
   - Portal de tickets para usuarios autenticados
   - Sistema de notificaciones de respuestas
   - Chat en vivo integrado

---

**¡La integración está completa y lista para usar!** 🎉

El frontend ahora se comunica directamente con el backend de Strapi para formularios de contacto y FAQs, con manejo robusto de errores, estados de carga, y fallbacks cuando sea necesario.

