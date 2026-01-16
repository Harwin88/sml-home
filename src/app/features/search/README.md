# 🔍 Componente de Búsqueda con Filtros 

## ✅ Lo que se ha creado

Se ha creado un componente completo de búsqueda de proveedores con las siguientes características:

### 📁 Archivos Creados

```
frontend/src/app/features/search/
├── provider-search.component.ts       # Lógica del componente
├── provider-search.component.html     # Template HTML
├── provider-search.component.scss     # Estilos
└── search.module.ts                   # Módulo Angular
```

### 🎯 Funcionalidades Implementadas

#### 1. **Búsqueda en Tiempo Real**
- Campo de búsqueda con debounce (300ms)
- Busca en: nombre, descripción y área de servicio
- Búsqueda mientras escribes

#### 2. **Filtros por Subcategorías**
- Organizado por categorías principales
- Selección múltiple de subcategorías
- Resaltado de categorías seleccionadas en los resultados
- Contador de subcategorías activas por categoría principal
- Botón para seleccionar todas las subcategorías de una categoría

#### 3. **Filtros Adicionales**
- **Rating**: Slider de 0 a 5 estrellas
- **Verificación**: Solo proveedores verificados
- **Rango de Precio**: Económico, Moderado o Premium

#### 4. **Visualización de Resultados**
- Grid responsive de tarjetas
- Información completa:
  - Foto del proveedor
  - Badge de verificado
  - Nombre y calificación
  - Años de experiencia
  - Categorías de servicio (resaltando las seleccionadas)
  - Rango de precio
  - Botones de acción (Llamar, Ver Perfil)

#### 5. **Paginación**
- Navegación entre páginas
- Muestra página actual y total
- Botones de anterior/siguiente

#### 6. **Estados de UI**
- Loading state con spinner
- Estado de error
- Sin resultados con sugerencia
- Contador de filtros activos
- Botón para limpiar todos los filtros

---

## 🚀 Cómo Usar

### Paso 1: Importar el Módulo

En tu `app.module.ts` o en un módulo de features:

```typescript
import { SearchModule } from './features/search/search.module';

@NgModule({
  imports: [
    // ... otros módulos
    SearchModule
  ]
})
export class AppModule { }
```

### Paso 2: Configurar la Ruta

En `app-routing.module.ts`:

```typescript
import { ProviderSearchComponent } from './features/search/provider-search.component';

const routes: Routes = [
  { 
    path: 'buscar', 
    component: ProviderSearchComponent 
  },
  { 
    path: '', 
    redirectTo: '/buscar', 
    pathMatch: 'full' 
  }
  // ... otras rutas
];
```

### Paso 3: Asegurarse de tener los Servicios

Verifica que tengas los servicios de:
- `CategoryService` en `src/app/core/services/`
- `ServiceProviderService` en `src/app/core/services/`

### Paso 4: Ejecutar la Aplicación

```bash
ng serve
```

Visita: http://localhost:4200/buscar

---

## 🎨 Personalización

### Cambiar Colores

Edita `provider-search.component.scss`:

```scss
// Color principal
$primary-color: #3498db;  // Azul

// Color de verificado
$verified-color: #27ae60;  // Verde

// Color de error
$error-color: #e74c3c;  // Rojo
```

### Ajustar Tamaño de Grid

```scss
.providers-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  //                                          ^^^^^^ Cambia este valor
}
```

### Cambiar Items por Página

En `provider-search.component.ts`:

```typescript
pageSize = 12;  // Cambia este número
```

---

## 📊 Flujo de Datos

```
1. Usuario selecciona filtros
   ↓
2. Se actualizan los Sets de selección
   (selectedSubcategories, minRating, etc.)
   ↓
3. Se llama a applyFilters()
   ↓
4. Se filtran los providers en memoria
   ↓
5. Se actualiza filteredProviders
   ↓
6. El template muestra los resultados
```

---

## 🔧 Funciones Principales

### `toggleSubcategory(subcategory)`
- Activa/desactiva una subcategoría
- Actualiza el Set de selección
- Re-aplica filtros

### `selectCategoryGroup(mainCategory)`
- Selecciona todas las subcategorías de una categoría principal
- Útil para selección rápida

### `applyFilters()`
- Aplica todos los filtros activos sobre `providers`
- Genera `filteredProviders` para mostrar

### `searchProviders(query)`
- Realiza búsqueda por texto
- Llama al backend con el query

### `clearFilters()`
- Limpia todos los filtros
- Reset completo del estado

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Buscar Plomeros en una Zona

1. Usuario escribe "Bogotá" en el buscador
2. Selecciona la subcategoría "Plomería"
3. Ajusta rating mínimo a 4.0
4. Ve los resultados filtrados

### Ejemplo 2: Ver Todos los Servicios de Jardinería

1. Click en "Jardinería" en el header de categoría
   - Selecciona automáticamente todas las subcategorías
2. Opcional: Filtra por "Solo verificados"
3. Ve todos los proveedores de jardinería

### Ejemplo 3: Buscar por Precio

1. Selecciona rango "Económico"
2. Opcional: Agrega subcategorías específicas
3. Ve proveedores económicos

---

## 🐛 Solución de Problemas

### No aparecen las categorías

**Causa**: Permisos no configurados en Strapi  
**Solución**: 
1. Ve a http://localhost:1338/admin
2. Settings → Users & Permissions → Roles → Public
3. Habilita `find` y `findOne` para Category

### No aparecen proveedores

**Causa**: No hay proveedores en la BD o permisos faltantes  
**Solución**:
1. Verifica permisos de Service-provider en Strapi
2. Verifica que haya proveedores creados
3. Revisa la consola del navegador para errores

### Error de CORS

**Causa**: Strapi no acepta solicitudes desde Angular  
**Solución**: Configura CORS en `backend/config/middlewares.ts`:

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: ['http://localhost:4200']
  }
}
```

### Los filtros no funcionan

**Causa**: Falta FormsModule o ReactiveFormsModule  
**Solución**: Verifica que `search.module.ts` tenga:

```typescript
imports: [
  CommonModule,
  ReactiveFormsModule,  // Para searchControl
  FormsModule,          // Para [(ngModel)]
  RouterModule
]
```

---

## 📈 Mejoras Futuras

Ideas para extender el componente:

- [ ] Guardar filtros en LocalStorage
- [ ] Compartir búsqueda por URL (query params)
- [ ] Ordenamiento (más recientes, mejor calificados, etc.)
- [ ] Vista de mapa con proveedores cercanos
- [ ] Filtro por disponibilidad
- [ ] Comparar proveedores
- [ ] Favoritos
- [ ] Historial de búsquedas
- [ ] Sugerencias automáticas
- [ ] Filtro por rango de precios específico ($-$$)

---

## 📚 Recursos

- [CategoryService](../../core/services/category.service.ts)
- [ServiceProviderService](../../core/services/service-provider.service.ts)
- [ANGULAR_INTEGRATION_GUIDE.md](../../../ANGULAR_INTEGRATION_GUIDE.md)

---

¡Listo para buscar y filtrar proveedores! 🎉
