# 🚀 Guía de Despliegue en Heroku - Strapi Backend

Esta guía te ayudará a configurar correctamente Strapi en Heroku.

## 📋 Requisitos Previos

1. Cuenta en Heroku
2. Heroku CLI instalado
3. Base de datos PostgreSQL (Heroku Postgres o externa)

## 🔧 Configuración en Heroku

### 1. Configurar Variables de Entorno

Configura las siguientes variables de entorno en Heroku usando el CLI o el Dashboard:

```bash
# Desde el CLI de Heroku
heroku config:set NODE_ENV=production --app kapi-e1c0c69d21fd

# Database (Heroku Postgres proporciona DATABASE_URL automáticamente)
heroku config:set DATABASE_CLIENT=postgres --app kapi-e1c0c69d21fd
heroku config:set DATABASE_SSL=true --app kapi-e1c0c69d21fd
heroku config:set DATABASE_SSL_REJECT_UNAUTHORIZED=false --app kapi-e1c0c69d21fd

# Admin Panel Secrets
heroku config:set ADMIN_JWT_SECRET=bueygGu0wk3EOUnOmsQIkGSwvm4JvHpv3QIE6MHIGAQz2H0XimscU2PDRKIEK+yFlLUalpKjp7SBLploRNLtTQ== --app kapi-e1c0c69d21fd
heroku config:set API_TOKEN_SALT=DVgAV0Oe42xsJX2SnPIzo3FaKsfy3LnlqEejQXloxOwDblDLqMKrVaMDyuojA90iNGHy+lfNwesx6vnr3vSkeQ== --app kapi-e1c0c69d21fd
heroku config:set TRANSFER_TOKEN_SALT=UWsjKXk6FdcsfZhxnIFJN1tDwuvfA7UHFQBIGBa+R50bZ9vU5dB2MTvdr48dc+TinVmpyDBgwfCHH4rfIklTpA== --app kapi-e1c0c69d21fd

# JWT Secret para Users-Permissions
heroku config:set JWT_SECRET=RVf05vXjFCQVYDQOUC0JkSfn/rUJlQi3h5ZaOR7J6p2TNKro6n8cpo7AVXL/Zhdkt9a9Cwr6kV5cR19bmRkTBQ== --app kapi-e1c0c69d21fd

# APP_KEYS (genera 4 keys separadas por coma)
heroku config:set APP_KEYS=key1,key2,key3,key4 --app kapi-e1c0c69d21fd

# Encryption Key
heroku config:set ENCRYPTION_KEY=UlFKx7L0eiKg1qWnlRQmu4+6hklMUZwwfpGzUjg81f4= --app kapi-e1c0c69d21fd

# URLs
heroku config:set STRAPI_ADMIN_URL=https://kapi-e1c0c69d21fd.herokuapp.com --app kapi-e1c0c69d21fd
heroku config:set CLIENT_URL=http://localhost:4200 --app kapi-e1c0c69d21fd

# CORS (permite tu frontend)
heroku config:set CORS_ORIGINS=https://tu-frontend.herokuapp.com,http://localhost:4200 --app kapi-e1c0c69d21fd
```

### 2. Configurar Base de Datos PostgreSQL

**Opción A: Heroku Postgres (Recomendado)**
```bash
# Agregar addon de Heroku Postgres
heroku addons:create heroku-postgresql:mini --app kapi-e1c0c69d21fd

# Heroku automáticamente configura DATABASE_URL
```

**Opción B: Base de Datos Externa**
Si usas una base de datos externa, configura:
```bash
heroku config:set DATABASE_URL=postgresql://usuario:password@host:5432/database --app kapi-e1c0c69d21fd
```

### 3. Verificar Configuración

Verifica todas las variables configuradas:
```bash
heroku config --app kapi-e1c0c69d21fd
```

### 4. Ver Logs

Para ver los logs en tiempo real y diagnosticar problemas:
```bash
heroku logs --tail --app kapi-e1c0c69d21fd
```

## 🐛 Solución de Problemas Comunes

### Error: "No se puede acceder"
1. **Verifica que el dyno esté corriendo:**
   ```bash
   heroku ps --app kapi-e1c0c69d21fd
   ```
   Si no está corriendo, inícialo:
   ```bash
   heroku ps:scale web=1 --app kapi-e1c0c69d21fd
   ```

2. **Verifica los logs de error:**
   ```bash
   heroku logs --tail --app kapi-e1c0c69d21fd
   ```

3. **Verifica las variables de entorno:**
   - Asegúrate de que todas las variables requeridas estén configuradas
   - Especialmente: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `APP_KEYS`

### Error: "Database connection failed"
- Verifica que `DATABASE_CLIENT=postgres` esté configurado
- Verifica que `DATABASE_SSL=true` esté configurado para Heroku Postgres
- Verifica que `DATABASE_URL` esté correctamente configurada

### Error: "JWT_SECRET not found"
- Asegúrate de configurar todas las variables de secretos: `JWT_SECRET`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`

## 📝 Generar Secrets

Si necesitas generar nuevos secrets:

```bash
# Generar JWT_SECRET o ADMIN_JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generar ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🔐 Variables de Entorno Críticas

Las siguientes variables son **OBLIGATORIAS** para que Strapi funcione en producción:

1. `NODE_ENV=production`
2. `DATABASE_CLIENT=postgres`
3. `DATABASE_URL` (proporcionada por Heroku Postgres automáticamente)
4. `DATABASE_SSL=true`
5. `ADMIN_JWT_SECRET`
6. `API_TOKEN_SALT`
7. `TRANSFER_TOKEN_SALT`
8. `JWT_SECRET`
9. `APP_KEYS` (4 keys separadas por coma)
10. `ENCRYPTION_KEY`

## 🚀 Despliegue

Después de configurar todas las variables:

```bash
# Hacer commit del Procfile
git add backend/Procfile
git commit -m "Add Procfile for Heroku deployment"
git push heroku main
```

## ✅ Verificación

Una vez desplegado, verifica que la aplicación esté funcionando:

```bash
# Ver estado de la app
heroku open --app kapi-e1c0c69d21fd

# Ver logs
heroku logs --tail --app kapi-e1c0c69d21fd
```

La aplicación debería estar disponible en: `https://kapi-e1c0c69d21fd.herokuapp.com`

