# 📦 Archivos Angular Listos para Usar

Los archivos TypeScript en esta carpeta están listos para copiar a tu proyecto Angular.

## 📁 Estructura

```
frontend/src/app/core/
├── config/
│   └── api.config.ts           # Configuración de Strapi API
│
├── models/
│   ├── strapi-response.model.ts  # Tipos de respuesta Strapi
│   ├── category.model.ts         # Modelo de categoría
│   └── service-provider.model.ts # Modelo de proveedor
│
└── services/
    ├── strapi-base.service.ts      # Servicio base con métodos CRUD
    ├── category.service.ts         # Servicio de categorías
    └── service-provider.service.ts # Servicio de proveedores
```

## 🚀 Cómo Usar

### Opción 1: Copiar a Proyecto Existente

Si ya tienes un proyecto Angular:

```bash
# Copiar toda la carpeta core a tu proyecto
xcopy /E /I frontend\src\app\core <tu-proyecto>\src\app\core
```

### Opción 2: Crear Proyecto Nuevo

```bash
# Crear proyecto Angular
ng new msl-hogar-app --routing --style=scss

# Navegar al proyecto
cd msl-hogar-app

# Copiar archivos
xcopy /E /I ..\frontend\src\app\core src\app\core
```

## ⚙️ Configuración Requerida

### 1. Habilitar HttpClient

En `src/app/app.module.ts`:

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule  // Agregar
  ]
})
export class AppModule { }
```

### 2. Actualizar API URL (si es necesario)

En `core/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:1338',  // Cambiar si es necesario
  // ...
};
```

## 📝 Ejemplo de Uso

```typescript
import { Component, OnInit } from '@angular/core';
import { CategoryService } from './core/services/category.service';
import { CategoryView } from './core/models/category.model';

@Component({
  selector: 'app-categories',
  template: `
    <div *ngFor="let cat of categories">
      <h2>{{ cat.name }}</h2>
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  categories: CategoryView[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getCategoryTree().subscribe(
      data => this.categories = data
    );
  }
}
```

## 🔗 Más Información

Ver [ANGULAR_INTEGRATION_GUIDE.md](../ANGULAR_INTEGRATION_GUIDE.md) para detalles completos.
