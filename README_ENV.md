# 📝 Variables de Entorno - Cómo Funciona

## ⚠️ Importante: Entender cómo funciona

En Angular, **los valores DEBEN estar escritos en los archivos TypeScript**. Esto es así porque:

1. Angular compila TypeScript a JavaScript
2. El código corre en el **navegador**, no en Node.js
3. El navegador **NO puede leer archivos .env** del sistema de archivos

## ✅ Solución Implementada

La solución es **generar automáticamente** los archivos `environment.ts` desde `.env.local`:

```
.env.local (tú editas esto)
    ↓
generate-env.js (script que lee .env.local)
    ↓
environment.ts (se genera automáticamente)
    ↓
Angular compila y usa estos valores
```

## 🔄 Flujo de Trabajo

1. **Edita `.env.local`** con tus valores:
   ```env
   API-URL=http://localhost:1338
   STRAPI-KEY=tu-api-key-aqui
   ```

2. **Ejecuta `npm start` o `npm run build`**
   - El script `generate-env.js` se ejecuta automáticamente
   - Lee `.env.local` y genera `environment.ts`
   - Angular compila con esos valores

3. **Los valores están en el código** (esto es necesario en Angular)
   - Pero se generan automáticamente desde `.env.local`
   - No los edites manualmente, se regenerarán

## 📌 Puntos Clave

- ✅ Los valores en `environment.ts` están escritos (esto es correcto)
- ✅ Se generan automáticamente desde `.env.local` (esto es lo importante)
- ✅ No edites `environment.ts` manualmente
- ✅ Edita solo `.env.local`

## 🎯 Esto es la Forma Estándar

Esta es la forma estándar de manejar variables de entorno en Angular. Proyectos como:
- Angular CLI oficial
- Ionic
- Nx monorepos

Todos usan este mismo enfoque: generar archivos environment desde variables de entorno durante el build.














