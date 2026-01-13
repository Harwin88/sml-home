# 🧪 Probar Endpoints de FAQ

## ✅ Endpoints Personalizados Disponibles

Todos estos endpoints **YA están públicos** y NO necesitan configuración adicional de permisos.

---

## 1️⃣ Filtrar por Categoría

### Endpoint
```
GET /api/faqs/category/:category
```

### Categorías Válidas
- `general`
- `search`
- `payments`
- `security`
- `account`
- `providers`
- `technical`

### Ejemplos de Prueba

**General:**
```
http://localhost:1338/api/faqs/category/general
```

**Búsqueda:**
```
http://localhost:1338/api/faqs/category/search
```

**Pagos:**
```
http://localhost:1338/api/faqs/category/payments
```

**Seguridad:**
```
http://localhost:1338/api/faqs/category/security
```

### Respuesta Esperada
```json
{
  "success": true,
  "category": "general",
  "count": 7,
  "data": [
    {
      "id": 1,
      "question": "Que es MSL Hogar?",
      "answer": "...",
      "category": "general",
      "icon": "help",
      "order": 1,
      "isPopular": true
    },
    ...
  ]
}
```

---

## 2️⃣ FAQs Populares

### Endpoint
```
GET /api/faqs/popular
```

### Ejemplo de Prueba
```
http://localhost:1338/api/faqs/popular
```

### Respuesta Esperada
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "id": 1,
      "question": "Que es MSL Hogar?",
      "answer": "...",
      "category": "general",
      "isPopular": true,
      "viewCount": 150,
      "helpfulCount": 45
    },
    ...
  ]
}
```

---

## 3️⃣ Buscar FAQs

### Endpoint
```
GET /api/faqs/search?q=termino
```

### Ejemplos de Prueba

**Buscar "plataforma":**
```
http://localhost:1338/api/faqs/search?q=plataforma
```

**Buscar "pago":**
```
http://localhost:1338/api/faqs/search?q=pago
```

**Buscar "profesional":**
```
http://localhost:1338/api/faqs/search?q=profesional
```

### Respuesta Esperada
```json
{
  "success": true,
  "query": "plataforma",
  "count": 3,
  "data": [
    {
      "id": 1,
      "question": "Que es MSL Hogar?",
      "answer": "MSL Hogar es una plataforma digital...",
      "category": "general"
    },
    ...
  ]
}
```

**Nota:** La búsqueda requiere mínimo 3 caracteres

---

## 4️⃣ Incrementar Vistas

### Endpoint
```
POST /api/faqs/:id/view
```

### Ejemplo de Prueba (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/1/view" -Method Post -ContentType "application/json"
```

### Respuesta Esperada
```json
{
  "success": true,
  "viewCount": 151
}
```

---

## 5️⃣ Marcar como Útil

### Endpoint
```
POST /api/faqs/:id/helpful
```

### Body
```json
{
  "helpful": true  // o false
}
```

### Ejemplo de Prueba (PowerShell)

**Marcar como útil:**
```powershell
$body = @{ helpful = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/1/helpful" -Method Post -Body $body -ContentType "application/json"
```

**Marcar como no útil:**
```powershell
$body = @{ helpful = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/1/helpful" -Method Post -Body $body -ContentType "application/json"
```

### Respuesta Esperada
```json
{
  "success": true,
  "data": {
    "helpfulCount": 46,
    "notHelpfulCount": 2
  }
}
```

---

## 6️⃣ Estadísticas (Solo Admin)

### Endpoint
```
GET /api/faqs/stats
```

Este endpoint requiere autenticación de administrador.

### Ejemplo de Prueba (con token)
```powershell
$headers = @{
    "Authorization" = "Bearer TU_TOKEN_AQUI"
}
Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/stats" -Headers $headers
```

### Respuesta Esperada
```json
{
  "success": true,
  "data": {
    "total": 32,
    "totalViews": 2450,
    "totalHelpful": 680,
    "totalNotHelpful": 45,
    "byCategory": {
      "general": 7,
      "search": 5,
      "payments": 4,
      "security": 4,
      "account": 4,
      "providers": 5,
      "technical": 3
    },
    "popular": 14,
    "helpfulRate": 93.8
  }
}
```

---

## 🔧 Prueba Rápida con PowerShell

### Script Todo-en-Uno
```powershell
# Probar todos los endpoints personalizados

Write-Host "1. Probando filtro por categoria general..." -ForegroundColor Yellow
try {
    $general = Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/category/general"
    Write-Host "✅ General: $($general.count) FAQs" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n2. Probando FAQs populares..." -ForegroundColor Yellow
try {
    $popular = Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/popular"
    Write-Host "✅ Populares: $($popular.count) FAQs" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n3. Probando busqueda..." -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/search?q=plataforma"
    Write-Host "✅ Busqueda 'plataforma': $($search.count) resultados" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n4. Probando incrementar vistas..." -ForegroundColor Yellow
try {
    $view = Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/1/view" -Method Post -ContentType "application/json"
    Write-Host "✅ Vistas incrementadas: $($view.viewCount)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n5. Probando marcar como util..." -ForegroundColor Yellow
try {
    $body = @{ helpful = $true } | ConvertTo-Json
    $helpful = Invoke-RestMethod -Uri "http://localhost:1338/api/faqs/1/helpful" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Marcado como util: $($helpful.data.helpfulCount) votos" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n✅ Prueba completada!" -ForegroundColor Green
```

---

## 🌐 Probar desde el Navegador

Abre estas URLs directamente en tu navegador:

1. **Todas las FAQs:**
   ```
   http://localhost:1338/api/faqs
   ```

2. **General:**
   ```
   http://localhost:1338/api/faqs/category/general
   ```

3. **Búsqueda:**
   ```
   http://localhost:1338/api/faqs/category/search
   ```

4. **Pagos:**
   ```
   http://localhost:1338/api/faqs/category/payments
   ```

5. **Populares:**
   ```
   http://localhost:1338/api/faqs/popular
   ```

6. **Buscar "pago":**
   ```
   http://localhost:1338/api/faqs/search?q=pago
   ```

---

## 📝 Frontend - Cómo Usar los Endpoints

### Desde FaqService.ts

**Filtrar por categoría:**
```typescript
this.faqService.getFaqsByCategory('general').subscribe(faqs => {
  console.log('FAQs de General:', faqs);
});
```

**FAQs populares:**
```typescript
this.faqService.getPopularFaqs().subscribe(faqs => {
  console.log('FAQs populares:', faqs);
});
```

**Buscar:**
```typescript
this.faqService.searchFaqs('plataforma').subscribe(faqs => {
  console.log('Resultados:', faqs);
});
```

**Incrementar vistas:**
```typescript
this.faqService.incrementView(1).subscribe(result => {
  console.log('Nueva cantidad de vistas:', result.viewCount);
});
```

**Marcar como útil:**
```typescript
this.faqService.markHelpful(1, true).subscribe(result => {
  console.log('Votos útiles:', result.helpfulCount);
});
```

---

## ❓ Por Qué No Aparecen en Permisos?

### Explicación Técnica

Los endpoints personalizados **NO aparecen** en el panel de permisos de Strapi porque:

1. **Son rutas custom** definidas en `custom-faq.ts`
2. **Ya están configuradas** con `auth: false` en el código
3. **No usan el sistema CRUD estándar** de Strapi

### Esto es NORMAL y NO es un problema

Los endpoints funcionan perfectamente sin aparecer en el panel de permisos.

### Si Necesitas Proteger un Endpoint Custom

Cambia en `custom-faq.ts`:
```typescript
{
  method: 'GET',
  path: '/faqs/category/:category',
  handler: 'faq.findByCategory',
  config: {
    auth: false,  // ← Cambiar a true para requerir autenticación
  },
}
```

---

## ✅ Verificación Final

### Lista de Verificación

- [ ] 1. Permisos `find` y `findOne` están activados en Public
- [ ] 2. `/api/faqs` devuelve las 32 FAQs
- [ ] 3. `/api/faqs/category/general` devuelve FAQs de General
- [ ] 4. `/api/faqs/popular` devuelve FAQs populares
- [ ] 5. `/api/faqs/search?q=plataforma` devuelve resultados
- [ ] 6. Frontend en `http://localhost:4200/help` muestra las FAQs
- [ ] 7. Los filtros por categoría funcionan en el frontend
- [ ] 8. La búsqueda funciona en el frontend

---

## 🎯 Resumen

**✅ Los endpoints personalizados YA están disponibles y públicos**

No necesitas configurar nada adicional en el panel de permisos. Solo asegúrate de que los endpoints CRUD básicos (`find` y `findOne`) estén activados en Public.

**Endpoints que YA funcionan:**
- ✅ `/api/faqs/category/:category` - Filtrar por categoría
- ✅ `/api/faqs/popular` - FAQs populares
- ✅ `/api/faqs/search?q=texto` - Búsqueda
- ✅ `/api/faqs/:id/view` - Incrementar vistas
- ✅ `/api/faqs/:id/helpful` - Marcar útil

**¡Pruébalos ahora!** 🚀

