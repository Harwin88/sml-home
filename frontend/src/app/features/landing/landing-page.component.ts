import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ServiceProviderService } from '../../core/services/service-provider.service';
import { CategoryView } from '../../core/models/category.model';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  mainCategories: CategoryView[] = [];
  loadingCategories = false;
  
  // Estadísticas
  totalProviders = 0;
  verifiedProviders = 0;
  averageRating = 0;
  totalReviews = 0;

  constructor(
    private categoryService: CategoryService,
    private providerService: ServiceProviderService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadStatistics();
  }

  /**
   * Cargar categorías principales
   */
  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getCategoryTree().subscribe({
      next: (categories) => {
        // Mostrar solo las 4 primeras categorías principales
        this.mainCategories = categories.slice(0, 4);
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loadingCategories = false;
      }
    });
  }

  /**
   * Cargar estadísticas de la plataforma
   */
  loadStatistics(): void {
    // Obtener todos los proveedores activos
    this.providerService.getAll({
      filters: {
        isActive: { $eq: true }
      },
      pagination: {
        page: 1,
        pageSize: 1000 // Obtener muchos para calcular estadísticas
      }
    }).subscribe({
      next: (response) => {
        const providers = response.data;
        this.totalProviders = providers.length;
        
        // Calcular proveedores verificados
        this.verifiedProviders = providers.filter((p: any) => p.isVerified).length;
        
        // Calcular rating promedio
        const ratings = providers
          .filter((p: any) => p.rating > 0)
          .map((p: any) => p.rating);
        
        if (ratings.length > 0) {
          this.averageRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        }
        
        // Calcular total de reseñas
        this.totalReviews = providers.reduce((sum: number, p: any) => {
          return sum + (p.totalReviews || 0);
        }, 0);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  /**
   * Formatear número con separadores de miles
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CO').format(num);
  }

  /**
   * Formatear rating con un decimal
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }
}

