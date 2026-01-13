# 🚀 Guía de Configuración - Backend MSL Hogar

## ✅ ¿Qué se ha creado?

Se han implementado **3 APIs completas** para el sistema de soporte:

1. **Contact Form** - Formularios de contacto desde el sitio web
2. **Support Ticket** - Sistema de tickets para seguimiento de solicitudes
3. **FAQ** - Preguntas frecuentes para el centro de ayuda

Cada API incluye:
- ✅ Schemas (modelos de datos)
- ✅ Controladores personalizados
- ✅ Servicios con lógica de negocio
- ✅ Rutas configuradas
- ✅ Permisos y seguridad

## 📦 Pasos para Activar el Backend

### 1. Iniciar Strapi

```bash
cd backend
npm run develop
```

Esto iniciará Strapi en modo desarrollo en: `http://localhost:1337`

### 2. Primer Inicio - Crear Cuenta Admin

Si es la primera vez que inicias Strapi:

1. Ve a `http://localhost:1337/admin`
2. Crea tu cuenta de administrador
3. Completa el registro

### 3. Los Schemas se Crearán Automáticamente

Al iniciar Strapi, detectará los nuevos schemas y:
- Creará las tablas en la base de datos
- Registrará los nuevos content types
- Configurará las relaciones

Deberías ver en la consola algo como:

```
✔ Building build context (40ms)
✔ Creating admin (224ms)
✔ Creating content-types (67ms)
[2026-01-13 18:00:00.000] info: Contact Form content-type has been registered
[2026-01-13 18:00:00.000] info: Support Ticket content-type has been registered
[2026-01-13 18:00:00.000] info: FAQ content-type has been registered
```

### 4. Configurar Permisos (IMPORTANTE)

#### Para Contact Form (Público):

1. Ve a **Settings** > **Users & Permissions Plugin** > **Roles**
2. Selecciona **Public**
3. En **Contact-form**, marca:
   - ✅ `create` (permitir envío de formularios sin autenticación)
4. Guarda los cambios

#### Para FAQ (Público):

1. En el mismo rol **Public**
2. En **Faq**, marca:
   - ✅ `find` (listar FAQs)
   - ✅ `findOne` (ver FAQ individual)
   - ✅ Todas las rutas custom (category, popular, search, view, helpful)
3. Guarda los cambios

#### Para Support Ticket (Solo Admin):

Los tickets solo deben ser gestionados por administradores, así que **no modificar permisos de Public**.

### 5. Poblar FAQs Iniciales

#### Opción A: Usando el Script de Seed

1. Con Strapi corriendo, abre otra terminal:

```bash
npm run strapi console
```

2. En la consola de Strapi, ejecuta:

```javascript
await require('./src/scripts/seed-faqs').default()
```

Esto creará 18 FAQs iniciales organizadas por categorías.

#### Opción B: Manual desde el Admin Panel

1. Ve a **Content Manager** > **FAQ**
2. Crea FAQs manualmente haciendo clic en "+ Create new entry"
3. No olvides **Publish** cada FAQ después de crearla

### 6. Verificar que Todo Funciona

#### Verificar Content Types

En el panel admin, deberías ver en **Content Manager**:
- Contact Form
- Support Ticket
- FAQ

#### Probar la API

**1. Probar FAQ (Público)**:

```bash
curl http://localhost:1337/api/faqs
```

Debería devolver las FAQs publicadas (si corriste el seed).

**2. Probar Contact Form (Público)**:

```bash
curl -X POST http://localhost:1337/api/contact-forms \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Test Usuario",
      "email": "test@example.com",
      "contactType": "general",
      "subject": "Prueba",
      "message": "Este es un mensaje de prueba de más de 20 caracteres"
    }
  }'
```

Debería devolver:

```json
{
  "success": true,
  "message": "Tu mensaje ha sido enviado exitosamente...",
  "ticketId": "MSL-1234567890-1234",
  "data": { ... }
}
```

**3. Ver los formularios enviados** (requiere autenticación admin):

Ve a **Content Manager** > **Contact Form** en el admin panel.

## 🔧 Configuración Opcional (Recomendada para Producción)

### 1. Configurar Envío de Emails

Para que funcione el envío de emails, necesitas configurar un proveedor:

#### Instalar Plugin de Email

```bash
npm install @strapi/plugin-email
npm install nodemailer
```

#### Configurar Variables de Entorno

Edita `backend/.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_SECURE=false

# Support Email
SUPPORT_EMAIL=soporte@mslhogar.com

# Admin URL
STRAPI_ADMIN_URL=http://localhost:1337
```

#### Crear Configuración del Plugin

Crea `backend/config/plugins.ts` (o edita si existe):

```typescript
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env('SMTP_PORT'),
        secure: env.bool('SMTP_SECURE', false),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SUPPORT_EMAIL', 'soporte@mslhogar.com'),
        defaultReplyTo: env('SUPPORT_EMAIL', 'soporte@mslhogar.com'),
      },
    },
  },
});
```

#### Activar Envío en los Servicios

Descomenta las líneas TODO en:
- `src/api/contact-form/services/contact-form.ts`
- `src/api/support-ticket/services/support-ticket.ts`
- `src/services/email.ts`

### 2. Configurar Rate Limiting con Redis (Producción)

Para un rate limiting más robusto:

```bash
npm install ioredis
```

Actualiza `src/api/contact-form/middlewares/rate-limit.ts` para usar Redis en lugar de memoria.

### 3. Variables de Entorno Importantes

Asegúrate de tener en `backend/.env`:

```env
# Admin Panel
ADMIN_JWT_SECRET=tu-secret-generado
API_TOKEN_SALT=tu-salt-generado
APP_KEYS=key1,key2,key3,key4

# Database (ya debería estar configurado)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=msl_hogar
DATABASE_USERNAME=tu_usuario
DATABASE_PASSWORD=tu_password

# Email (si lo configuras)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SUPPORT_EMAIL=soporte@mslhogar.com

# URLs
STRAPI_ADMIN_URL=http://localhost:1337
CLIENT_URL=http://localhost:4200
```

## 🔗 Conectar con el Frontend

### 1. Actualizar Variables de Entorno del Frontend

Edita `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:1337', // URL del backend
};
```

### 2. Actualizar ContactService

En `frontend/src/app/core/services/contact.service.ts`, **descomenta** y actualiza el método `submitContactForm`:

```typescript
submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.post<any>(
    `${this.apiUrl}/contact-forms`,
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
      return throwError(() => new Error(error.error?.message || 'Error al enviar el formulario'));
    })
  );
}
```

### 3. (Opcional) Crear FaqService

Si quieres cargar las FAQs desde el backend en lugar de tenerlas hardcodeadas, crea `frontend/src/app/core/services/faq.service.ts`:

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

Luego, actualiza `help.component.ts` para inyectar este servicio y cargar FAQs desde el backend.

## 📊 Panel de Administración

Una vez que todo esté configurado, podrás:

### Ver Formularios de Contacto

1. Ve a **Content Manager** > **Contact Form**
2. Verás todos los formularios enviados
3. Puedes:
   - Cambiar el estado (`new` → `in_progress` → `resolved`)
   - Cambiar la prioridad
   - Agregar notas de respuesta
   - Asignar a alguien

### Gestionar Tickets de Soporte

1. Ve a **Content Manager** > **Support Ticket**
2. Verás todos los tickets
3. Puedes:
   - Ver detalles completos
   - Agregar respuestas
   - Asignar tickets a usuarios
   - Cambiar estado y prioridad
   - Ver métricas (tiempos de respuesta/resolución)

### Administrar FAQs

1. Ve a **Content Manager** > **FAQ**
2. Puedes:
   - Crear nuevas FAQs
   - Editar existentes
   - Organizar por categorías
   - Marcar como populares
   - Ver estadísticas de vistas
   - Adjuntar videos o archivos

## 🎯 Endpoints Disponibles

Ver la documentación completa en: `backend/SUPPORT_API_DOCUMENTATION.md`

### Resumen Rápido:

#### Públicos (sin autenticación):
- `POST /api/contact-forms` - Enviar formulario
- `GET /api/faqs` - Listar FAQs
- `GET /api/faqs/category/:category` - FAQs por categoría
- `GET /api/faqs/popular` - FAQs populares
- `GET /api/faqs/search?q=query` - Buscar FAQs
- `POST /api/faqs/:id/view` - Incrementar vistas
- `POST /api/faqs/:id/helpful` - Marcar útil/no útil

#### Admin (requiere autenticación):
- Todos los endpoints de Contact Form (excepto create)
- Todos los endpoints de Support Ticket
- CRUD de FAQs
- Estadísticas y reportes

## 🐛 Solución de Problemas

### Error: "Content type not found"

**Solución**: Reinicia Strapi. Los content types se registran en el inicio.

```bash
# Detener Strapi (Ctrl+C)
# Iniciar nuevamente
npm run develop
```

### Error: "Forbidden" al llamar a la API

**Solución**: Verifica los permisos en **Settings** > **Users & Permissions Plugin** > **Roles** > **Public**.

### Las FAQs no se cargan

**Solución**: 
1. Verifica que hayas ejecutado el seed o creado FAQs manualmente
2. Asegúrate de **publicar** las FAQs (botón "Publish" en el admin)
3. Verifica permisos públicos para FAQ

### Los emails no se envían

**Solución**: Esto es normal. Los emails actualmente se loggean en consola. Para activar el envío real, sigue la sección "Configurar Envío de Emails".

## 📚 Recursos Adicionales

- **Documentación del API**: `backend/SUPPORT_API_DOCUMENTATION.md`
- **Strapi Docs**: https://docs.strapi.io/
- **Plugin Email**: https://docs.strapi.io/dev-docs/plugins/email

## ✅ Checklist de Configuración

- [ ] Strapi iniciado y corriendo
- [ ] Cuenta admin creada
- [ ] Content types visibles en el admin panel
- [ ] Permisos públicos configurados (Contact Form y FAQ)
- [ ] FAQs iniciales creadas (seed o manual)
- [ ] API de Contact Form probada (curl o Postman)
- [ ] API de FAQ probada
- [ ] Variables de entorno del frontend actualizadas
- [ ] ContactService del frontend conectado al backend
- [ ] (Opcional) Plugin de email configurado
- [ ] (Opcional) Redis para rate limiting

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu backend estará completamente funcional y conectado con el frontend.

**Próximos pasos sugeridos**:
1. Probar el flujo completo desde el frontend
2. Configurar el envío de emails para producción
3. Crear FAQs adicionales según necesidades
4. Personalizar templates de email
5. Configurar webhooks para notificaciones (Slack, Discord, etc.)

**¿Necesitas ayuda?** Revisa la documentación completa en `SUPPORT_API_DOCUMENTATION.md` o contacta al equipo de desarrollo.

