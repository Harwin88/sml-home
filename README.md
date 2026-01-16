# 🎨 Frontend Angular - MSL Hogar

## 📋 Estructura Creada

```
frontend/src/app/core/
├── config/
│   └── api.config.ts              ✅ Configuración de endpoints
├── models/
│   ├── strapi-response.model.ts   ✅ Interfaces de respuesta Strapi
│   ├── category.model.ts          ✅ Modelo de categoría
│   └── service-provider.model.ts   ✅ Modelo de proveedor
└── services/
    ├── strapi-base.service.ts     ✅ Servicio base genérico
    ├── category.service.ts        ✅ Servicio de categorías
    └── service-provider.service.ts ✅ Servicio de proveedores
```

## 🚀 Inicio Rápido

### 1. Crear Proyecto Angular (si no existe)

```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli

# Crear proyecto
ng new msl-hogar-frontend --routing --style=scss
cd msl-hogar-frontend
```

### 2. Copiar Archivos

Copia los archivos de `d:\MSL-hogar\frontend\src\app\core\` a tu proyecto Angular.

### 3. Habilitar HttpClient

En `src/app/app.module.ts`:

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,  // ⬅️ Agregar esto
    AppRoutingModule
  ],
  // ...
})
export class AppModule { }
```

### 4. Configurar Permisos en Strapi

1. Accede a http://localhost:1338/admin
2. Settings → Users & Permissions → Roles → Public
3. Habilita:
   - Category: `find`, `findOne`
   - Service-provider: `find`, `findOne`

### 5. Probar en un Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { CategoryService } from './core/services/category.service';

@Component({
  selector: 'app-home',
  template: `
    <h1>Categorías de Servicios</h1>
    <div *ngFor="let category of categories">
      <h2>{{ category.icon }} {{ category.name }}</h2>
      <p>{{ category.description }}</p>
      <ul>
        <li *ngFor="let sub of category.subcategories">
          {{ sub.icon }} {{ sub.name }}
        </li>
      </ul>
    </div>
  `
})
export class HomeComponent implements OnInit {
  categories: any[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getCategoryTree().subscribe(
      data => this.categories = data,
      error => console.error('Error:', error)
    );
  }
}
```

## 📡 Ejemplos de Uso

### Listar Categorías Principales

```typescript
this.categoryService.getMainCategories().subscribe(
  categories => console.log(categories)
);
```

### Buscar Categoría por Slug

```typescript
this.categoryService.getBySlug('plomeria').subscribe(
  category => console.log(category)
);
```

### Buscar Proveedores por Categoría

```typescript
this.providerService.getByCategory('plomeria', 1, 10).subscribe(
  providers => console.log(providers)
);
```

### Buscar Proveedores Verificados

```typescript
this.providerService.getVerifiedProviders().subscribe(
  providers => console.log(providers)
);
```

### Buscar Texto en Proveedores

```typescript
this.providerService.search('fontanero').subscribe(
  providers => console.log(providers)
);
```

## 🎯 Próximos Pasos

1. ✅ Crear proyecto Angular
2. ✅ Copiar archivos core
3. ✅ Configurar HttpClient
4. ✅ Configurar permisos en Strapi
5. ⬜ Crear componentes de UI
6. ⬜ Agregar estilos
7. ⬜ Implementar routing
8. ⬜ Agregar manejo de errores global
9. ⬜ Agregar interceptors HTTP
10. ⬜ Implementar autenticación (si es necesario)

## 📚 Recursos

- [Guía Completa de Integración](../ANGULAR_INTEGRATION_GUIDE.md)
- [Documentación de Strapi REST API](https://docs.strapi.io/cms/api/rest)
- [Documentación de Angular HttpClient](https://angular.io/api/common/http/HttpClient)

---

🎉 **¡Todo listo para comenzar a desarrollar tu frontend!**
