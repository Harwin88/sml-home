# 🔒 Configurar Permisos para Crear FAQs

## Problema Actual

El API token no tiene permisos para crear FAQs, por lo que obtienes **Error 401 - Unauthorized**.

## Solución: Configurar Permisos en Strapi Admin

### Paso 1: Acceder al Admin Panel

1. Abre tu navegador y ve a: `http://localhost:1338/admin`
2. Inicia sesión con tus credenciales de administrador

### Paso 2: Configurar Permisos del API Token

1. En el menú lateral, ve a **Settings** (⚙️ Configuración)
2. En la sección **Global Settings**, haz clic en **API Tokens**
3. Encuentra tu token (el que está en `frontend/src/assets/config.json`)
4. Haz clic en **✏️ Edit** (Editar)

### Paso 3: Activar Permisos para FAQs

En la sección de permisos, busca **FAQ** y activa:

- ✅ **find** - Buscar/listar FAQs
- ✅ **findOne** - Obtener una FAQ por ID
- ✅ **create** - Crear nuevas FAQs ⚠️ **IMPORTANTE PARA EL SEED**
- ✅ **update** - Actualizar FAQs existentes
- ✅ **delete** - Eliminar FAQs

### Paso 4: Guardar Cambios

1. Haz clic en el botón **Save** (Guardar) en la parte superior derecha
2. Espera la confirmación de que los permisos se guardaron correctamente

## ✅ Verificar que Funciona

Después de configurar los permisos, ejecuta el seed nuevamente:

```bash
node backend/seed-faqs-api.js
```

Deberías ver:

```
🌱 Iniciando seed de FAQs usando API HTTP...

✅ FAQ creada: "¿Qué es MSL Hogar?"
✅ FAQ creada: "¿En qué ciudades están disponibles?"
...

📊 Resumen del seed:
   ✨ Creadas: 32
   ⏭️  Omitidas (ya existían): 0
   ❌ Errores: 0
   📝 Total procesadas: 32

✅ Seed completado!
```

## 🔐 Seguridad

**Importante:** El token con permisos de `create` es poderoso. Considera:

1. **Para producción**: Crea un token separado solo para seeds/desarrollo
2. **Permisos mínimos**: Después del seed, puedes remover el permiso `create` si no lo necesitas
3. **Token público**: El token del frontend solo debería tener permisos de `find` y `findOne` (lectura)

## 🎯 Permisos Recomendados

### Token de Frontend (público - frontend/src/assets/config.json)
- ✅ **find** - Para listar FAQs en `/help`
- ✅ **findOne** - Para ver FAQs individuales
- ❌ **create** - NO (usuarios no deberían crear FAQs)
- ❌ **update** - NO
- ❌ **delete** - NO

### Token de Admin/Seeds (privado - solo para scripts)
- ✅ **find**
- ✅ **findOne**
- ✅ **create** - Para ejecutar seeds
- ✅ **update** - Para actualizar en seeds
- ✅ **delete** - Para limpiar datos de prueba

## 🛠️ Métodos Alternativos (si no quieres modificar permisos)

### Opción 1: Crear FAQs manualmente en Admin Panel

1. Ve a `http://localhost:1338/admin`
2. Content Manager → FAQ → Create new entry
3. Llena los campos manualmente (32 veces 😅)

### Opción 2: Usar SQL directo (más rápido)

Ya tienes un script SQL listo:

```bash
# Desde tu máquina local
docker exec -i MSL-hogar-postgres psql -U strapi -d dam_strapi < backend/insert-faqs-sql.sql
```

Este método inserta directamente en PostgreSQL sin pasar por la API.

### Opción 3: Crear FAQs desde Strapi Console (recomendado si SQL falla)

```bash
docker exec -it MSL-hogar-strapi npm run strapi console
```

Luego en la consola:

```javascript
const faqs = [ /* copiar array de seed-faqs-exec.js */ ];
for (const faq of faqs) {
  await strapi.entityService.create('api::faq.faq', { data: { ...faq, publishedAt: new Date() } });
}
```

## 📞 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Verifica que el token en `frontend/src/assets/config.json` sea el mismo que estás editando en Strapi
2. Asegúrate de hacer clic en **Save** después de cambiar permisos
3. Reinicia el contenedor si es necesario: `docker-compose restart strapi`

