# 🔧 Solución de Error 403 en Hostinger

## ✅ Pasos para Desplegar Correctamente

### 1. Generar Build
```bash
cd frontend
npm run build:prod
```

### 2. Verificar Estructura de Archivos

El contenido debe estar en: `frontend/dist/kapi-frontend/`

Debe contener:
```
dist/kapi-frontend/
├── index.html          ← Archivo principal (DEBE estar en public_html/)
├── .htaccess          ← Configuración Apache (versión mínima)
├── assets/
│   └── config.json
├── main.*.js
├── polyfills.*.js
├── runtime.*.js
├── styles.*.css
└── favicon.ico
```

### 3. Subir a Hostinger

**IMPORTANTE:** Sube el **CONTENIDO** de `dist/kapi-frontend/`, NO la carpeta `kapi-frontend` misma.

**Estructura correcta en `public_html/`:**
```
public_html/
├── index.html          ← En la raíz
├── .htaccess          ← En la raíz
├── assets/
├── main.*.js
├── polyfills.*.js
├── runtime.*.js
├── styles.*.css
└── favicon.ico
```

**❌ ESTRUCTURA INCORRECTA:**
```
public_html/
└── kapi-frontend/     ← ❌ NO debe haber esta carpeta
    ├── index.html
    └── ...
```

### 4. Si Sigue el Error 403

#### Opción A: Probar sin .htaccess (temporalmente)
1. Renombra `.htaccess` a `.htaccess.backup` en `public_html/`
2. Prueba acceder al sitio
3. Si funciona, el problema está en `.htaccess` - usa la versión mínima

#### Opción B: Verificar Permisos
En Hostinger, asegúrate de que:
- Archivos: `644`
- Carpetas: `755`
- `.htaccess`: `644`

#### Opción C: Verificar index.html
- `index.html` DEBE estar directamente en `public_html/`
- NO debe estar en una subcarpeta
- Verifica que el archivo no esté vacío

### 5. Verificar Variables de Entorno

En el panel de Hostinger:
- Ve a **Variables de Entorno**
- Verifica que existan:
  - `API_URL` (requerida)
  - `STRAPI_KEY` (opcional)

## 🔍 Checklist de Verificación

- [ ] `npm run build:prod` ejecutado sin errores
- [ ] Contenido de `dist/kapi-frontend/` subido a `public_html/`
- [ ] `index.html` está directamente en `public_html/` (no en subcarpeta)
- [ ] `.htaccess` está en `public_html/`
- [ ] Permisos correctos (644 para archivos, 755 para carpetas)
- [ ] Variables de entorno configuradas en Hostinger
- [ ] No hay otro `.htaccess` conflictivo

## 📝 Comandos Útiles

```bash
# Verificar contenido del build
ls -la dist/kapi-frontend/

# Verificar que index.html existe
ls -la dist/kapi-frontend/index.html

# Verificar que .htaccess existe
ls -la dist/kapi-frontend/.htaccess
```

## 🚨 Si Nada Funciona

1. **Elimina todo** de `public_html/` (haz backup primero)
2. **Sube SOLO** `index.html` primero
3. Prueba acceder - debe mostrar algo (aunque falle al cargar recursos)
4. Si funciona, agrega el resto de archivos uno por uno
5. Finalmente agrega `.htaccess`

## 💡 Nota sobre .htaccess

El `.htaccess` actual es **mínimo** y solo contiene lo esencial para Angular Router.
Si sigue causando problemas, prueba sin él (solo para desarrollo/rutas básicas).

