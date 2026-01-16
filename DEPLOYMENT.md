# 🚀 Guía de Despliegue en Hostinger

Esta guía explica cómo desplegar el frontend de kapi en Hostinger.

## 📋 Prerequisitos

1. Variables de entorno configuradas en Hostinger:
   - `API_URL`: URL de la API (ej: `https://api.kapi.help`)
   - `STRAPI_KEY`: API Key de Strapi (opcional)

## 🔨 Paso 1: Generar Build de Producción

Ejecuta el siguiente comando en la terminal, desde la carpeta `frontend/`:

```bash
npm run build:prod
```

Este comando:
- ✅ Genera las variables de entorno automáticamente
- ✅ Crea el build optimizado de producción
- ✅ Genera los archivos en `dist/kapi-frontend/`

## 📦 Paso 2: Preparar Archivos para Subir

El contenido para subir está en:
```
frontend/dist/kapi-frontend/
```

Este directorio contiene:
- `index.html` - Archivo principal
- `assets/` - Recursos estáticos (imágenes, config.json)
- `*.js` - Archivos JavaScript compilados
- `styles.css` - Estilos compilados
- `favicon.ico` - Icono del sitio
- `3rdpartylicenses.txt` - Licencias

**IMPORTANTE:** También debes incluir el archivo `.htaccess` que está en la raíz de `frontend/`.

## 📤 Paso 3: Subir Archivos a Hostinger

1. **Accede a hPanel → Archivos → Administrador de archivos**

2. **Navega a la carpeta `public_html` de tu dominio `kapi.help`**

3. **Haz una copia de seguridad** de los archivos actuales (si existen)

4. **Borra los archivos antiguos** de `public_html` (excepto `.htaccess` si ya existe)

5. **Sube TODOS los archivos** desde `frontend/dist/kapi-frontend/` a `public_html/`

   ⚠️ **IMPORTANTE:** Sube el **CONTENIDO** de `dist/kapi-frontend/`, NO la carpeta completa.
   
   Estructura correcta en `public_html/`:
   ```
   public_html/
   ├── index.html          ← Debe estar en la raíz
   ├── .htaccess          ← Archivo de configuración Apache
   ├── assets/
   │   └── config.json
   ├── main.js
   ├── polyfills.js
   ├── runtime.js
   ├── styles.css
   └── favicon.ico
   ```

6. **Sube el archivo `.htaccess`** desde `frontend/.htaccess` a `public_html/`

## ✅ Paso 4: Verificar Despliegue

1. **Verifica que `index.html` existe en la raíz de `public_html/`**

2. **Verifica que `.htaccess` existe en la raíz de `public_html/`**

3. **Verifica los permisos:**
   - Archivos: `644` o `755`
   - Carpetas: `755`
   - `.htaccess`: `644`

4. **Prueba el sitio:**
   - Abre `https://kapi.help`
   - Debe cargar sin errores 403
   - Prueba navegar entre páginas (rutas de Angular)

## 🔧 Solución de Problemas

### Error 403 (Forbidden)

**Causas posibles:**
- ❌ `index.html` no está en la raíz de `public_html`
- ❌ Falta el archivo `.htaccess`
- ❌ Permisos incorrectos
- ❌ Reglas `.htaccess` incorrectas

**Solución:**
1. Verifica que `index.html` esté directamente en `public_html/` (no en una subcarpeta)
2. Asegúrate de que `.htaccess` existe y tiene las reglas correctas
3. Renombra temporalmente `.htaccess` a `.htaccess.backup` para probar si el problema es ese archivo

### Error 404 en Rutas

Si las rutas de Angular (como `/search`, `/profile`) devuelven 404:

**Causa:** Falta el `.htaccess` o tiene reglas incorrectas

**Solución:** Asegúrate de que `.htaccess` tiene la regla de rewrite correcta:
```apache
RewriteRule ^ index.html [L]
```

### Variables de Entorno No Funcionan

**Causa:** Las variables no están configuradas en el panel de Hostinger

**Solución:**
1. Ve a hPanel → Variables de Entorno
2. Agrega `API_URL` y `STRAPI_KEY`
3. Vuelve a hacer el build: `npm run build:prod`
4. Sube nuevamente los archivos

## 📝 Comandos Rápidos

```bash
# Build de producción
npm run build:prod

# Build de desarrollo (con source maps)
npm run build

# Verificar contenido de dist
ls -la dist/kapi-frontend/
```

## 🎯 Checklist de Despliegue

- [ ] Variables de entorno configuradas en Hostinger
- [ ] `npm run build:prod` ejecutado exitosamente
- [ ] Backup de archivos antiguos hecho
- [ ] Contenido de `dist/kapi-frontend/` subido a `public_html/`
- [ ] `.htaccess` subido a `public_html/`
- [ ] `index.html` está en la raíz de `public_html/`
- [ ] Permisos correctos configurados
- [ ] Sitio funciona correctamente
- [ ] Rutas de Angular funcionan (SPA)

## 📞 Notas Adicionales

- El build de producción está optimizado y minificado
- Los archivos tienen hashes en los nombres para cache busting
- El `.htaccess` permite que Angular Router funcione correctamente
- Las variables de entorno se inyectan durante el build

