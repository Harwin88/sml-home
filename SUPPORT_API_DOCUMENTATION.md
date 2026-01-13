# 📘 Documentación del API de Soporte - MSL Hogar

## 📋 Índice

1. [Schemas Creados](#schemas-creados)
2. [Endpoints de Contact Form](#endpoints-de-contact-form)
3. [Endpoints de Support Ticket](#endpoints-de-support-ticket)
4. [Endpoints de FAQ](#endpoints-de-faq)
5. [Servicio de Email](#servicio-de-email)
6. [Configuración](#configuración)
7. [Uso desde el Frontend](#uso-desde-el-frontend)

---

## 🗂️ Schemas Creados

### 1. Contact Form (`api::contact-form.contact-form`)

**Ubicación**: `src/api/contact-form/content-types/contact-form/schema.json`

**Campos**:
- `name` (string, requerido): Nombre del contacto
- `email` (email, requerido): Email del contacto
- `phone` (string, opcional): Teléfono
- `contactType` (enum, requerido): Tipo de consulta
  - `general`, `technical`, `billing`, `provider`, `account`, `suggestion`, `other`
- `subject` (string, requerido): Asunto del mensaje
- `message` (text, requerido): Mensaje completo
- `status` (enum): Estado del formulario
  - `new`, `read`, `in_progress`, `resolved`, `closed`
- `priority` (enum): Prioridad
  - `low`, `normal`, `high`, `urgent`
- `ticketId` (string, único): ID de ticket generado
- `assignedTo` (string): Persona asignada
- `responseNotes` (text): Notas de respuesta
- `respondedAt` (datetime): Fecha de respuesta
- `ipAddress` (string): IP del solicitante
- `userAgent` (string): User agent del navegador
- `source` (string): Fuente del formulario (default: "website")
- `relatedTicket` (relation): Ticket de soporte relacionado

### 2. Support Ticket (`api::support-ticket.support-ticket`)

**Ubicación**: `src/api/support-ticket/content-types/support-ticket/schema.json`

**Campos**:
- `ticketNumber` (string, único, requerido): Número de ticket
- `title` (string, requerido): Título del ticket
- `description` (text, requerido): Descripción del problema
- `category` (enum, requerido): Categoría del ticket
- `status` (enum, requerido): Estado actual
  - `open`, `pending`, `in_progress`, `waiting_customer`, `resolved`, `closed`, `cancelled`
- `priority` (enum, requerido): Nivel de prioridad
- `requesterName/Email/Phone`: Datos del solicitante
- `assignedTo` (relation): Usuario asignado
- `department` (enum): Departamento responsable
- `tags` (json): Etiquetas del ticket
- `attachments` (media): Archivos adjuntos
- `internalNotes` (text): Notas internas
- `resolution` (text): Resolución del ticket
- `resolvedAt/By` (datetime/relation): Datos de resolución
- `firstResponseTime` (integer): Tiempo de primera respuesta en minutos
- `resolutionTime` (integer): Tiempo de resolución en minutos
- `satisfactionRating` (1-5): Calificación del cliente
- `satisfactionComment` (text): Comentario de satisfacción
- `relatedProvider` (relation): Proveedor relacionado
- `sourceForm` (relation): Formulario de contacto origen
- `responses` (component): Respuestas del ticket

### 3. FAQ (`api::faq.faq`)

**Ubicación**: `src/api/faq/content-types/faq/schema.json`

**Campos**:
- `question` (string, requerido): Pregunta
- `answer` (text, requerido): Respuesta
- `category` (enum, requerido): Categoría
  - `general`, `search`, `payments`, `security`, `account`, `providers`, `technical`
- `icon` (string): Ícono de Material Icons
- `order` (integer): Orden de visualización
- `isPopular` (boolean): Pregunta popular
- `viewCount` (integer): Número de vistas
- `helpfulCount` (integer): Marcadas como útil
- `notHelpfulCount` (integer): Marcadas como no útil
- `keywords` (json): Keywords para búsqueda
- `relatedFaqs` (relation): FAQs relacionadas
- `videoUrl` (string): URL de video explicativo
- `attachments` (media): Archivos adjuntos

### 4. Ticket Response Component

**Ubicación**: `src/components/support/ticket-response.json`

**Campos**:
- `message` (text, requerido): Mensaje de respuesta
- `respondedBy` (string, requerido): Nombre del respondedor
- `respondedByEmail` (email, requerido): Email del respondedor
- `isInternal` (boolean): Nota interna (no visible para cliente)
- `isCustomerResponse` (boolean): Respuesta del cliente
- `attachments` (media): Archivos adjuntos
- `responseTime` (datetime): Fecha y hora de respuesta

---

## 📮 Endpoints de Contact Form

### Base URL: `/api/contact-forms`

#### 1. Crear Formulario de Contacto
```http
POST /api/contact-forms
```

**Auth**: No requerida (público)

**Body**:
```json
{
  "data": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "3001234567",
    "contactType": "general",
    "subject": "Consulta sobre servicios",
    "message": "Me gustaría saber más sobre los servicios disponibles..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.",
  "ticketId": "MSL-1234567890-1234",
  "data": { /* contact form entity */ }
}
```

**Características**:
- ✅ Rate limiting: máximo 5 envíos por hora por IP
- ✅ Generación automática de ticketId
- ✅ Captura de IP y User Agent
- ✅ Creación automática de Support Ticket para tipos específicos
- ✅ Envío de email de confirmación (si configurado)
- ✅ Notificación al equipo de soporte

#### 2. Listar Formularios (Admin)
```http
GET /api/contact-forms
```

**Auth**: Admin requerido

**Query Params**:
- `filters[status][$eq]=new`
- `filters[contactType][$eq]=technical`
- `sort=createdAt:desc`
- `pagination[page]=1&pagination[pageSize]=25`

#### 3. Actualizar Estado (Admin)
```http
PUT /api/contact-forms/:id
```

**Auth**: Admin requerido

---

## 🎫 Endpoints de Support Ticket

### Base URL: `/api/support-tickets`

#### 1. Listar Tickets (Admin)
```http
GET /api/support-tickets
```

**Auth**: Admin requerido

#### 2. Crear Ticket (Admin)
```http
POST /api/support-tickets
```

**Auth**: Admin requerido

#### 3. Agregar Respuesta
```http
POST /api/support-tickets/:id/response
```

**Auth**: Admin requerido

**Body**:
```json
{
  "response": {
    "message": "Hemos recibido tu solicitud...",
    "respondedBy": "María García",
    "respondedByEmail": "maria@mslhogar.com",
    "isInternal": false,
    "isCustomerResponse": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated ticket */ }
}
```

**Características**:
- ✅ Cálculo automático de `firstResponseTime`
- ✅ Actualización de estado del ticket
- ✅ Envío de email al cliente (si configurado)

#### 4. Resolver Ticket
```http
POST /api/support-tickets/:id/resolve
```

**Auth**: Admin requerido

**Body**:
```json
{
  "resolution": "Problema resuelto mediante...",
  "resolvedBy": 1
}
```

**Características**:
- ✅ Cálculo automático de `resolutionTime`
- ✅ Marca fecha de resolución
- ✅ Envío de email de resolución

#### 5. Cerrar Ticket
```http
POST /api/support-tickets/:id/close
```

**Auth**: Admin requerido

#### 6. Asignar Ticket
```http
POST /api/support-tickets/:id/assign
```

**Auth**: Admin requerido

**Body**:
```json
{
  "userId": 1,
  "department": "technical_support"
}
```

#### 7. Estadísticas de Tickets
```http
GET /api/support-tickets/stats
```

**Auth**: Admin requerido

**Response**:
```json
{
  "total": 150,
  "byStatus": {
    "open": 25,
    "in_progress": 40,
    "resolved": 70,
    "closed": 15
  },
  "byPriority": {
    "low": 30,
    "normal": 80,
    "high": 35,
    "urgent": 5
  },
  "byCategory": {
    "technical": 45,
    "general": 60,
    "billing": 25,
    "provider_issue": 20
  },
  "avgFirstResponseTime": 45,
  "avgResolutionTime": 320
}
```

---

## ❓ Endpoints de FAQ

### Base URL: `/api/faqs`

#### 1. Listar FAQs
```http
GET /api/faqs
```

**Auth**: No requerida (público)

**Características**:
- ✅ Solo devuelve FAQs publicadas
- ✅ Ordenadas por `order` y `createdAt`
- ✅ Incluye `relatedFaqs`

#### 2. FAQs por Categoría
```http
GET /api/faqs/category/:category
```

**Auth**: No requerida

**Ejemplo**: `/api/faqs/category/general`

**Response**:
```json
{
  "success": true,
  "category": "general",
  "count": 8,
  "data": [ /* faqs */ ]
}
```

#### 3. FAQs Populares
```http
GET /api/faqs/popular
```

**Auth**: No requerida

**Response**: Top 10 FAQs populares

#### 4. Buscar FAQs
```http
GET /api/faqs/search?q=pago
```

**Auth**: No requerida

**Query Params**:
- `q` (string, min 3 caracteres): Término de búsqueda

**Busca en**:
- Pregunta
- Respuesta
- Keywords

#### 5. Incrementar Vistas
```http
POST /api/faqs/:id/view
```

**Auth**: No requerida

**Uso**: Llamar cuando el usuario abre/lee una FAQ

#### 6. Marcar como Útil
```http
POST /api/faqs/:id/helpful
```

**Auth**: No requerida

**Body**:
```json
{
  "helpful": true
}
```

**Uso**: Feedback de usuarios sobre utilidad de la FAQ

#### 7. Estadísticas de FAQs
```http
GET /api/faqs/stats
```

**Auth**: Admin requerido

---

## 📧 Servicio de Email

**Ubicación**: `src/services/email.ts`

### Métodos Disponibles

#### 1. `send(options)`
Envío genérico de email

#### 2. `sendContactConfirmation(contactForm)`
Email de confirmación al enviar formulario de contacto

#### 3. `notifySupportTeam(contactForm)`
Notificación al equipo de soporte de nuevo formulario

#### 4. `sendTicketResponse(ticket, response)`
Email al cliente con nueva respuesta en ticket

#### 5. `sendTicketResolved(ticket)`
Email de ticket resuelto con solicitud de calificación

### Configuración

**Actualmente**: Los emails se loggean en consola (modo desarrollo)

**Para producción**, instalar y configurar plugin de email:

```bash
npm install @strapi/plugin-email
npm install nodemailer
# O un proveedor específico como SendGrid, Mailgun, etc.
```

**Configurar en** `config/plugins.ts`:

```typescript
export default {
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      settings: {
        defaultFrom: 'soporte@mslhogar.com',
        defaultReplyTo: 'soporte@mslhogar.com',
      },
    },
  },
};
```

**Variables de entorno**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-password
SUPPORT_EMAIL=soporte@mslhogar.com
STRAPI_ADMIN_URL=https://admin.mslhogar.com
```

---

## 🔐 Configuración

### Rate Limiting

**Archivo**: `src/api/contact-form/middlewares/rate-limit.ts`

**Configuración actual**:
- Ventana: 1 hora
- Máximo: 5 requests por IP

**Para producción**: Usar Redis o similar para almacenamiento distribuido

### Permissions

1. **Contact Form**:
   - `create`: Público (con rate limit)
   - `find`, `findOne`, `update`, `delete`: Solo Admin

2. **Support Ticket**:
   - Todos los endpoints: Solo Admin

3. **FAQ**:
   - `find`, `findOne`, búsquedas, vistas, helpful: Público
   - `create`, `update`, `delete`: Solo Admin

---

## 🔌 Uso desde el Frontend

### Actualizar ContactService

**Archivo**: `frontend/src/app/core/services/contact.service.ts`

```typescript
submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.post<ContactResponse>(
    `${environment.apiUrl}/api/contact-forms`,
    { data: formData },
    { headers }
  ).pipe(
    map(response => ({
      success: response.success,
      message: response.message,
      ticketId: response.ticketId,
    })),
    catchError(error => {
      console.error('Error al enviar formulario:', error);
      return throwError(() => new Error('Error al enviar el formulario'));
    })
  );
}
```

### Conectar FAQs con Backend

**Crear nuevo servicio**: `frontend/src/app/core/services/faq.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/api/faqs`;

  constructor(private http: HttpClient) {}

  getAllFaqs(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getFaqsByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/category/${category}`);
  }

  getPopularFaqs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/popular`);
  }

  searchFaqs(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  incrementView(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/view`, {});
  }

  markHelpful(id: number, helpful: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/helpful`, { helpful });
  }
}
```

### Variables de Entorno

**Archivo**: `frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:1337',
};
```

**Archivo**: `frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.mslhogar.com',
};
```

---

## 🚀 Seed de FAQs

**Script**: `src/scripts/seed-faqs.ts`

### Ejecutar Seed

1. Iniciar Strapi:
```bash
cd backend
npm run develop
```

2. En otra terminal, abrir consola de Strapi:
```bash
npm run strapi console
```

3. Ejecutar el seed:
```javascript
await require('./src/scripts/seed-faqs').default()
```

### Resultado Esperado

```
🌱 Iniciando seed de FAQs...
✨ FAQ creada: "¿Qué es MSL Hogar?"
✨ FAQ creada: "¿En qué ciudades están disponibles?"
...

📊 Resumen del seed:
   ✨ Creadas: 18
   ✅ Actualizadas: 0
   ⏭️  Sin cambios: 0
   📝 Total: 18

✅ Seed de FAQs completado!
```

---

## 📊 Próximos Pasos

1. **Configurar Email Provider** (SendGrid, Mailgun, AWS SES)
2. **Implementar Redis** para rate limiting distribuido
3. **Agregar Webhooks** para notificaciones en Slack/Discord
4. **Crear Dashboard** de métricas de soporte
5. **Implementar Auto-assignment** de tickets
6. **Agregar Sistema de SLA** (Service Level Agreement)
7. **Crear API para Portal del Cliente** (ver sus tickets)
8. **Implementar Chat en Vivo** para soporte instantáneo

---

## 📝 Notas Importantes

1. **Todos los endpoints están listos** pero los emails actualmente solo se loggean en consola
2. **Rate limiting está en memoria** - usar Redis en producción
3. **Las FAQs deben ser creadas** usando el script de seed o manualmente en el admin panel
4. **Los permisos están configurados** pero revisar según necesidades específicas
5. **Los componentes de respuesta** requieren Strapi 5+ con soporte de componentes repetibles

---

**Desarrollado con** ❤️ **para MSL Hogar Backend API**

