# 🔧 Configuración de Variables de Entorno

Este proyecto usa un archivo `.env.local` para configurar las variables de entorno. Los archivos `environment.ts` se generan automáticamente desde este archivo.

## 📋 Variables Requeridas

- `API_URL`: URL base de la API de Strapi (ej: `http://localhost:1338`)
- `STRAPI_KEY`: API Token de Strapi para autenticación (opcional)

## 🚀 Configuración

### 1. Crear archivo .env.local

En la raíz del proyecto `frontend/`, crea un archivo `.env.local`:

```env
# URL de la API de Strapi
API-URL=http://localhost:1338

# API Token de Strapi (opcional)
STRAPI-KEY=tu-api-token-aqui
```

**Nota:** Los nombres de las variables usan guiones (`API-URL` y `STRAPI-KEY`), no guiones bajos.

### 2. Generar archivos environment

Los archivos `environment.ts` se generan automáticamente cuando ejecutas:

```bash
npm run generate-env  # Generar manualmente
npm start            # Se genera automáticamente antes de servir
npm run build        # Se genera automáticamente antes de construir
```

## 📝 Notas Importantes

1. **Archivo .env.local**: 
   - Este archivo NO debe subirse al repositorio (está en .gitignore)
   - Contiene información sensible como API keys
   - Cada desarrollador debe crear su propio `.env.local`

2. **Archivos environment.ts**:
   - Estos archivos son **generados automáticamente** desde `.env.local`
   - **NO edites estos archivos manualmente** - tus cambios se perderán
   - Si necesitas cambiar valores, edita `.env.local` y ejecuta `npm run generate-env`

3. **API Token de Strapi**: 
   - Para obtener tu API Token:
     - Accede al panel de administración de Strapi
     - Ve a Settings → API Tokens
     - Crea un nuevo token o usa uno existente
     - Copia el token y úsalo en `STRAPI_KEY`

4. **Endpoint de Categorías**: 
   - El endpoint `/api/categories` está configurado automáticamente
   - Se usa para cargar las categorías nodo hoja como filtros del buscador

## 🔄 Flujo de Trabajo

1. Crea/edita `.env.local` con tus variables
2. Ejecuta `npm start` o `npm run build`
3. El script `generate-env` se ejecuta automáticamente
4. Los archivos `environment.ts` se actualizan con los valores de `.env.local`

## ⚠️ Troubleshooting

Si los valores no se están aplicando:

1. Verifica que `.env.local` existe en `frontend/.env.local`
2. Verifica el formato del archivo (sin espacios alrededor del `=`)
3. Ejecuta manualmente: `npm run generate-env`
4. Verifica que los archivos `environment.ts` se hayan actualizado
