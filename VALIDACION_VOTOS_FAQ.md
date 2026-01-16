# 🔒 Validación de Votos en FAQs

## 📋 Descripción

Sistema de validación que **previene votos múltiples** del mismo usuario en una FAQ. Usa `localStorage` para persistir los votos entre sesiones del navegador.

---

## ✅ Funcionalidad Implementada

### **1. Control de Votos**
- ✅ Un usuario solo puede votar **una vez** por FAQ
- ✅ Los votos se guardan en `localStorage`
- ✅ Persiste entre sesiones (si cierra y abre el navegador)
- ✅ Mensaje visual cuando ya votó

### **2. Experiencia de Usuario**

**Antes de votar:**
```
¿Te resultó útil esta respuesta?
[👍 Sí (10)] [👎 No (2)]
```

**Después de votar:**
```
¿Te resultó útil esta respuesta?

  ✅ Gracias por tu opinión
  
  👍 10   👎 2
```

---

## 🔧 Implementación Técnica

### **1. Componente TypeScript**

#### **Propiedades añadidas:**

```typescript
// Set para almacenar IDs de FAQs votadas
private votedFaqs: Set<string> = new Set();

// Key para localStorage
private readonly VOTED_FAQS_KEY = 'msl_faq_voted';
```

#### **Métodos implementados:**

**`loadVotedFaqs()`** - Carga votos desde localStorage:
```typescript
private loadVotedFaqs(): void {
  try {
    const stored = localStorage.getItem(this.VOTED_FAQS_KEY);
    if (stored) {
      const votedArray = JSON.parse(stored);
      this.votedFaqs = new Set(votedArray);
    }
  } catch (error) {
    console.error('Error al cargar votos desde localStorage:', error);
    this.votedFaqs = new Set();
  }
}
```

**`saveVotedFaqs()`** - Guarda votos en localStorage:
```typescript
private saveVotedFaqs(): void {
  try {
    const votedArray = Array.from(this.votedFaqs);
    localStorage.setItem(this.VOTED_FAQS_KEY, JSON.stringify(votedArray));
  } catch (error) {
    console.error('Error al guardar votos en localStorage:', error);
  }
}
```

**`hasVoted(faq)`** - Verifica si ya votó:
```typescript
hasVoted(faq: Faq): boolean {
  const faqId = faq.documentId || faq.id?.toString();
  return faqId ? this.votedFaqs.has(faqId) : false;
}
```

**`markAsVoted(faqId)`** - Marca FAQ como votada:
```typescript
private markAsVoted(faqId: string): void {
  this.votedFaqs.add(faqId);
  this.saveVotedFaqs();
}
```

**`markAsHelpful(faq, helpful, event)`** - Actualizado:
```typescript
markAsHelpful(faq: Faq, helpful: boolean, event: Event): void {
  event.stopPropagation();
  
  const faqId = faq.documentId || faq.id?.toString();
  if (!faqId) return;

  // ⚠️ Validación: Verificar si ya votó
  if (this.hasVoted(faq)) {
    console.log('Ya has votado por esta FAQ');
    return;
  }

  this.faqService.markHelpful(faqId, helpful).subscribe({
    next: (result) => {
      faq.helpfulCount = result.helpfulCount;
      faq.notHelpfulCount = result.notHelpfulCount;
      
      // Marcar como votado
      this.markAsVoted(faqId);
      
      // Track evento
      this.analytics.trackEvent('FAQ', helpful ? 'Helpful' : 'Not Helpful', faq.question);
    },
    error: (error) => console.error('Error al marcar FAQ:', error)
  });
}
```

---

### **2. Template HTML**

**Estructura condicional:**

```html
<div class="faq-feedback">
  <p class="feedback-question">¿Te resultó útil esta respuesta?</p>
  
  <!-- Botones: Se muestran solo si NO ha votado -->
  <div class="feedback-buttons" *ngIf="!hasVoted(faq)">
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
  
  <!-- Mensaje: Se muestra solo si YA votó -->
  <div class="feedback-voted" *ngIf="hasVoted(faq)">
    <mat-icon class="voted-icon">check_circle</mat-icon>
    <p class="voted-message">Gracias por tu opinión</p>
    <div class="feedback-stats">
      <span *ngIf="faq.helpfulCount && faq.helpfulCount > 0">
        <mat-icon>thumb_up</mat-icon> {{ faq.helpfulCount }}
      </span>
      <span *ngIf="faq.notHelpfulCount && faq.notHelpfulCount > 0">
        <mat-icon>thumb_down</mat-icon> {{ faq.notHelpfulCount }}
      </span>
    </div>
  </div>
</div>
```

---

### **3. Estilos SCSS**

**Mensaje de "Ya votado":**

```scss
.feedback-voted {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: var(--border-radius-md);
  text-align: center;

  .voted-icon {
    font-size: 2rem;
    width: 2rem;
    height: 2rem;
    color: var(--color-success);
    animation: checkmark 0.5s ease-in-out;
  }

  .voted-message {
    color: var(--color-success);
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0;
  }

  .feedback-stats {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--color-text-secondary);
      font-size: 0.85rem;

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }
  }
}
```

**Animación del checkmark:**

```scss
@keyframes checkmark {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

---

## 📊 Flujo de Validación

```
1. Usuario abre /help
   ↓
2. Constructor: loadVotedFaqs()
   ↓ 
3. Lee localStorage: 'msl_faq_voted'
   ↓
4. Parsea JSON → Set<string>
   ↓
5. Template: *ngIf="!hasVoted(faq)"
   ↓
6. Si NO votó: Muestra botones
   ↓
7. Usuario hace clic en "Sí" o "No"
   ↓
8. markAsHelpful() verifica hasVoted()
   ↓
9. Si ya votó: return (no hace nada)
   ↓
10. Si no votó: Envía petición al backend
   ↓
11. Backend actualiza contadores
   ↓
12. Frontend: markAsVoted(faqId)
   ↓
13. Agrega faqId al Set
   ↓
14. saveVotedFaqs() → localStorage
   ↓
15. Template: *ngIf="hasVoted(faq)"
   ↓
16. Muestra mensaje "Gracias por tu opinión"
```

---

## 🔑 Datos en localStorage

### **Key:**
```
msl_faq_voted
```

### **Valor (JSON):**
```json
[
  "abc123xyz",
  "def456uvw",
  "ghi789rst"
]
```

**Estructura:**
- Array de strings
- Cada string es un `documentId` o `id` de FAQ
- Se convierte a `Set<string>` para búsquedas rápidas

---

## 🧪 Cómo Probar

### **1. Probar en el navegador:**

1. Abre el centro de ayuda:
   ```
   http://localhost:4200/help
   ```

2. Expande una FAQ

3. Haz clic en "Sí" o "No"

4. **Verifica:**
   - Los botones desaparecen
   - Aparece mensaje verde: "Gracias por tu opinión"
   - Se muestran los contadores

5. **Intenta votar de nuevo:**
   - Los botones no aparecen
   - Solo se muestra el mensaje de agradecimiento

6. **Recarga la página (F5):**
   - El mensaje de "Gracias" sigue apareciendo
   - No puedes votar de nuevo

7. **Prueba en otra FAQ:**
   - Puedes votar normalmente
   - Solo está bloqueada la FAQ que ya votaste

---

### **2. Verificar localStorage:**

**En DevTools (F12):**

1. Pestaña **Application** (Chrome) o **Storage** (Firefox)

2. Busca `localStorage`

3. Verás la key: `msl_faq_voted`

4. Valor: `["abc123xyz", "def456uvw"]`

---

### **3. Resetear votos (para testing):**

**Opción 1: DevTools**
```javascript
// En la consola del navegador (F12)
localStorage.removeItem('msl_faq_voted');
location.reload();
```

**Opción 2: Borrar manualmente**
- DevTools → Application/Storage → localStorage
- Clic derecho en `msl_faq_voted` → Delete
- Recargar página

---

## 🔒 Seguridad y Limitaciones

### **✅ Ventajas:**
- ✅ Simple y efectivo para usuarios normales
- ✅ No requiere autenticación
- ✅ Persiste entre sesiones
- ✅ No sobrecarga el backend
- ✅ UX clara e inmediata

### **⚠️ Limitaciones:**

**1. Un usuario técnico podría borrar localStorage:**
```javascript
localStorage.removeItem('msl_faq_voted');
```

**Solución:** Para producción, considera agregar validación en el backend:
- Rate limiting por IP
- Validación de fingerprint del navegador
- Cooldown entre votos (ej: 1 voto cada 5 minutos por FAQ)

**2. Votos solo están en el navegador:**
- Si usa otro navegador/dispositivo, puede votar de nuevo
- Si borra cookies/localStorage, puede votar de nuevo

**Solución:** Para validación más estricta:
- Requiere autenticación de usuario
- Validación en backend por userId

**3. Modo incógnito permite votos múltiples:**
- localStorage se borra al cerrar
- Cada sesión incógnita es "nueva"

**Solución:** 
- Rate limiting por IP en el backend
- Implementar captcha para votos sospechosos

---

## 🚀 Mejoras Futuras (Opcionales)

### **1. Validación en Backend**

Agregar tabla en BD:

```sql
CREATE TABLE faq_votes (
  id SERIAL PRIMARY KEY,
  faq_id VARCHAR(255) NOT NULL,
  user_ip VARCHAR(45) NOT NULL,
  helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(faq_id, user_ip)
);
```

Validar en el controlador:

```typescript
async markHelpful(ctx) {
  const { id } = ctx.params;
  const { helpful } = ctx.request.body;
  const userIp = ctx.request.ip;

  // Verificar si ya votó
  const existingVote = await strapi.db.query('api::faq-vote.faq-vote').findOne({
    where: { faq_id: id, user_ip: userIp }
  });

  if (existingVote) {
    return ctx.badRequest('Ya has votado por esta FAQ');
  }

  // Guardar voto
  await strapi.db.query('api::faq-vote.faq-vote').create({
    data: { faq_id: id, user_ip: userIp, helpful }
  });

  // Actualizar contadores...
}
```

---

### **2. Rate Limiting**

Limitar votos por IP:

```typescript
// En middleware o controlador
const rateLimiter = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastVote = rateLimiter.get(ip);
  
  if (lastVote && now - lastVote < 5000) { // 5 segundos
    return false; // Rechazar
  }
  
  rateLimiter.set(ip, now);
  return true; // Permitir
}
```

---

### **3. Fingerprinting**

Usar una librería como `fingerprintjs` para identificar navegadores:

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

async getBrowserFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
```

---

## ✅ Resumen

### **Implementación Actual (localStorage):**
- ✅ Simple y efectiva
- ✅ Buena UX
- ✅ Previene votos múltiples de usuarios normales
- ✅ Sin carga adicional al backend
- ⚠️ Puede ser evadida por usuarios técnicos

### **Para Producción:**
Si el spam de votos es un problema real:
1. Implementar validación por IP en backend
2. Agregar rate limiting
3. Considerar autenticación de usuarios

### **Para el 99% de los casos:**
La solución actual con localStorage es **suficiente y recomendada**.

---

## 📚 Archivos Modificados

- ✅ `frontend/src/app/features/support/help.component.ts`
- ✅ `frontend/src/app/features/support/help.component.html`
- ✅ `frontend/src/app/features/support/support.component.scss`

---

**¡Validación de votos implementada con éxito!** 🎉

