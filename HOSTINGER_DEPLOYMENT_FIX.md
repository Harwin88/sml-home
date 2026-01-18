# 🔧 Solución: Cambios No Se Despliegan en Hostinger

## 🚨 Problemas Identificados

### 1. **Output Directory Incorrecto**
- ❌ **Hostinger configurado:** `dist`
- ✅ **Angular genera:** `dist/kapi-frontend`
- **Solución:** Cambiar en Hostinger a `dist/kapi-frontend`

### 2. **Build Command Incorrecto**
- ❌ **Hostinger configurado:** `npm run build`
- ✅ **Debería ser:** `npm run build:prod`
- **Solución:** Cambiar el comando de build en Hostinger

### 3. **Caché del Navegador**
- Los archivos tienen hashes, pero el navegador puede estar cacheando
- **Solución:** Limpiar caché o hacer hard refresh

## ✅ Solución Paso a Paso

### Paso 1: Actualizar Configuración en Hostinger

En el panel de Hostinger, actualiza:

1. **Output directory:**
   ```
   dist/kapi-frontend
   ```
   (En lugar de solo `dist`)

2. **Build command:**
   ```
   npm run build:prod
   ```
   (En lugar de `npm run build`)

3. **Mantener:**
   - Branch: `main-front` ✅
   - Node version: `20.x` ✅
   - Root directory: `./` ✅

### Paso 2: Verificar Variables de Entorno

Asegúrate de que las variables de entorno estén configuradas:
- `API_URL`: `https://kapi-e1c0c69d21fd.herokuapp.com` (o tu URL de Heroku)
- `STRAPI_KEY`: (tu clave de Strapi)

### Paso 3: Forzar Nuevo Build

1. **Haz un commit y push** de tus cambios al branch `main-front`:
   ```bash
   git add .
   git commit -m "Update: cambios recientes"
   git push origin main-front
   ```

2. **En Hostinger:**
   - Ve a la sección de despliegue
   - Haz clic en **"Redeploy"** o **"Rebuild"**
   - Esto forzará un nuevo build con los últimos cambios

### Paso 4: Limpiar Caché

#### En el Navegador:
- **Chrome/Edge:** `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
- **Firefox:** `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)
- O abre en modo incógnito

#### En Hostinger:
- Algunos planes tienen caché de CDN
- Ve a la configuración de caché y limpia el caché

### Paso 5: Verificar el Build

Después del despliegue, verifica:

1. **Logs del build en Hostinger:**
   - Revisa que el build se completó sin errores
   - Verifica que se generaron los archivos en `dist/kapi-frontend/`

2. **Estructura de archivos:**
   - Debe existir `dist/kapi-frontend/index.html`
   - Debe existir `dist/kapi-frontend/.htaccess`
   - Debe existir `dist/kapi-frontend/assets/`

## 🔍 Verificación Adicional

### Verificar que los Cambios Están en el Branch

```bash
cd frontend
git log --oneline -5
git status
```

### Verificar el Build Localmente

```bash
cd frontend
npm run build:prod
ls -la dist/kapi-frontend/
```

Si el build local funciona pero Hostinger no, el problema está en la configuración de Hostinger.

## 🎯 Checklist de Verificación

- [ ] Cambios commitados y pusheados a `main-front`
- [ ] Output directory en Hostinger: `dist/kapi-frontend`
- [ ] Build command en Hostinger: `npm run build:prod`
- [ ] Variables de entorno configuradas
- [ ] Build ejecutado exitosamente en Hostinger
- [ ] Caché del navegador limpiado
- [ ] Sitio funciona correctamente

## 🚨 Si Aún No Funciona

### Opción 1: Build Manual y Subida Manual

1. **Genera el build localmente:**
   ```bash
   cd frontend
   npm run build:prod
   ```

2. **Sube manualmente los archivos:**
   - Ve a `frontend/dist/kapi-frontend/`
   - Sube TODO el contenido a `public_html/` en Hostinger
   - Asegúrate de que `index.html` esté en la raíz de `public_html/`

### Opción 2: Verificar Logs de Build

En Hostinger, revisa los logs del build para ver si hay errores:
- Errores de compilación
- Errores de dependencias
- Errores de permisos

### Opción 3: Contactar Soporte de Hostinger

Si nada funciona, contacta al soporte de Hostinger con:
- Logs del build
- Configuración actual
- Descripción del problema

## 📝 Notas Importantes

1. **Los archivos tienen hashes:** Cada build genera archivos con nombres únicos (ej: `main.abc123.js`). Esto es normal y ayuda con el cache busting.

2. **El `.htaccess` es crítico:** Sin él, las rutas de Angular no funcionarán correctamente.

3. **Variables de entorno:** Se inyectan durante el build, no en runtime. Si cambias variables, debes hacer un nuevo build.

4. **Branch correcto:** Asegúrate de que `main-front` tiene todos tus cambios recientes.

