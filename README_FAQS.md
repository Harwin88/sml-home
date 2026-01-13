# 📋 FAQs - Documentación

## ✅ **Cómo se crean las FAQs**

Las FAQs se crean automáticamente mediante una **migración de Strapi** al iniciar el servidor.

**Archivo:** `database/migrations/2026.01.13T19.00.00.seed-initial-faqs.js`

### **Ejecución automática:**

Cuando inicias Strapi con:
```bash
npm run develop
```

La migración se ejecuta automáticamente y crea las 32 FAQs iniciales publicadas.

---

## 📂 **Archivos importantes**

### **Migración (seed):**
- `database/migrations/2026.01.13T19.00.00.seed-initial-faqs.js` - Crea las 32 FAQs iniciales

### **API:**
- `src/api/faq/content-types/faq/schema.json` - Schema del content type
- `src/api/faq/controllers/faq.ts` - Controladores (find, search, stats, etc.)
- `src/api/faq/routes/faq.ts` - Rutas principales (CRUD)
- `src/api/faq/routes/custom-faq.ts` - Rutas personalizadas (search, category, popular, etc.)
- `src/api/faq/services/faq.ts` - Servicios

### **Scripts útiles:**
- `check-faqs.js` - Verificar FAQs en el API
- `verificar-todo.js` - Verificación completa del sistema
- `publicar-faqs.js` - Publicar FAQs en borrador (si es necesario)
- `verificar-estructura-bd.js` - Verificar BD directamente

---

## 🔍 **Verificar FAQs**

### **1. Verificación completa del sistema (RECOMENDADO):**
```bash
node verificar-sistema-completo.js
```
Este script verifica:
- ✅ Que las FAQs fueron creadas por la migración
- ✅ Endpoint de incrementar vistas
- ✅ Endpoint de marcar como útil/no útil
- ✅ Búsqueda por categoría
- ✅ Búsqueda por texto
- ✅ FAQs populares

### **2. Verificar solo FAQs en el API:**
```bash
node check-faqs.js
```

### **3. Probar funcionalidad de feedback:**
```bash
node test-faq-feedback.js
```

### **4. Verificar todo (legacy):**
```bash
node verificar-todo.js
```

### **5. En el navegador:**
- Admin Panel: http://localhost:1338/admin/content-manager/collection-types/api::faq.faq
- API público: http://localhost:1338/api/faqs
- Frontend: http://localhost:4200/help

---

## 📝 **Estructura de las FAQs**

**Total: 32 FAQs organizadas en 7 categorías:**

- **general** (7 FAQs) - Información general sobre MSL Hogar
- **search** (5 FAQs) - Búsqueda y filtros
- **payments** (4 FAQs) - Métodos de pago y facturación
- **security** (4 FAQs) - Seguridad y privacidad
- **account** (4 FAQs) - Gestión de cuenta
- **providers** (5 FAQs) - Para proveedores de servicios
- **technical** (3 FAQs) - Soporte técnico

---

## 🔧 **Configuración**

### **Permisos públicos (necesarios):**

Para que el frontend pueda acceder a las FAQs, configura los permisos en:

**Settings → Users & Permissions → Roles → Public → FAQ**

Activar:
- ✅ `find` - Listar todas las FAQs
- ✅ `findOne` - Ver una FAQ específica
- ✅ `findByCategory` - Buscar por categoría
- ✅ `findPopular` - FAQs populares
- ✅ `search` - Buscar FAQs

Más detalles en: `CONFIGURAR_PERMISOS_FAQ.md`

---

## 📊 **Endpoints disponibles**

### **Públicos:**
- `GET /api/faqs` - Todas las FAQs
- `GET /api/faqs/:id` - Una FAQ específica
- `GET /api/faqs/category/:category` - FAQs por categoría
- `GET /api/faqs/popular` - FAQs populares
- `GET /api/faqs/search?q=termino` - Buscar FAQs

### **Con autenticación:**
- `POST /api/faqs` - Crear FAQ (admin)
- `PUT /api/faqs/:id` - Actualizar FAQ (admin)
- `DELETE /api/faqs/:id` - Eliminar FAQ (admin)
- `PUT /api/faqs/:id/view` - Incrementar vistas
- `POST /api/faqs/:id/helpful` - Marcar como útil/no útil
- `GET /api/faqs/stats` - Estadísticas (admin)

---

## 🆘 **Troubleshooting**

### **Las FAQs no aparecen:**

1. **Verificar que existan:**
   ```bash
   node check-faqs.js
   ```

2. **Verificar que estén publicadas:**
   ```bash
   node verificar-estructura-bd.js
   ```

3. **Verificar permisos públicos:**
   - Settings → Users & Permissions → Roles → Public → FAQ
   - Activar `find` y `findOne`

4. **Si no están publicadas:**
   ```bash
   node publicar-faqs.js
   ```

### **La migración no se ejecutó:**

Si al iniciar Strapi no se crearon las FAQs:

1. Verifica que el archivo de migración existe:
   ```
   database/migrations/2026.01.13T19.00.00.seed-initial-faqs.js
   ```

2. Reinicia Strapi:
   ```bash
   npm run develop
   ```

3. Verifica los logs de Strapi para ver si hay errores

---

## 📚 **Más información**

- **Configurar permisos:** `CONFIGURAR_PERMISOS_FAQ.md`
- **Endpoints del API:** `TEST_FAQ_ENDPOINTS.md`
- **Configuración general:** `SETUP_GUIDE.md`
- **API de soporte:** `SUPPORT_API_DOCUMENTATION.md`

---

## ✅ **Resumen**

1. ✅ Las FAQs se crean automáticamente con la migración
2. ✅ Al iniciar Strapi con `npm run develop`
3. ✅ Se crean 32 FAQs en 7 categorías
4. ✅ Todas publicadas y listas para usar
5. ✅ Configura permisos públicos para el frontend
6. ✅ Usa `check-faqs.js` para verificar

---

**🎉 ¡Las FAQs están listas y funcionando!**

