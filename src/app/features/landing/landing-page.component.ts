import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../core/services/category.service';
import { ServiceProviderService } from '../../core/services/service-provider.service';
import { FeaturedProviderService } from '../../core/services/featured-provider.service';
import { CategoryView } from '../../core/models/category.model';
import { FeaturedProvider } from '../../core/services/featured-provider.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  mainCategories: CategoryView[] = [];
  loadingCategories = false;
  
  // Estadísticas
  totalProviders = 0;
  verifiedProviders = 0;
  averageRating = 0;
  totalReviews = 0;

  // Proveedores destacados
  featuredProviders: FeaturedProvider[] = [];
  featuredProvider: FeaturedProvider | null = null;
  currentFeaturedIndex = 0;
  loadingFeaturedProvider = false;
  private featuredProviderInterval: any;

  constructor(
    private categoryService: CategoryService,
    private providerService: ServiceProviderService,
    private featuredProviderService: FeaturedProviderService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadStatistics();
    this.loadFeaturedProviders();
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.featuredProviderInterval) {
      clearInterval(this.featuredProviderInterval);
    }
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

  /**
   * Cargar todos los proveedores destacados
   */
  loadFeaturedProviders(): void {
    this.loadingFeaturedProvider = true;
    this.featuredProviderService.getAll().subscribe({
      next: (providers) => {
        console.log('Featured providers loaded:', providers);
        this.featuredProviders = providers;
        
        if (providers.length > 0) {
          // Mostrar el primero
          this.currentFeaturedIndex = 0;
          this.featuredProvider = providers[0];
          console.log('Showing first featured provider:', this.featuredProvider);
          
          // Si hay más de uno, iniciar rotación cada 60 segundos
          if (providers.length > 1) {
            this.startFeaturedProviderRotation();
          }
        } else {
          this.featuredProvider = null;
        }
        
        this.loadingFeaturedProvider = false;
      },
      error: (err) => {
        console.error('Error loading featured providers:', err);
        this.featuredProviders = [];
        this.featuredProvider = null;
        this.loadingFeaturedProvider = false;
      }
    });
  }

  /**
   * Iniciar rotación automática de proveedores destacados
   */
  startFeaturedProviderRotation(): void {
    // Limpiar intervalo anterior si existe
    if (this.featuredProviderInterval) {
      clearInterval(this.featuredProviderInterval);
    }

    // Rotar cada 60 segundos (60000 ms)
    this.featuredProviderInterval = setInterval(() => {
      if (this.featuredProviders.length > 0) {
        // Incrementar índice y volver al inicio si llega al final
        this.currentFeaturedIndex = (this.currentFeaturedIndex + 1) % this.featuredProviders.length;
        this.featuredProvider = this.featuredProviders[this.currentFeaturedIndex];
        console.log(`Rotating to featured provider ${this.currentFeaturedIndex + 1}/${this.featuredProviders.length}:`, this.featuredProvider);
      }
    }, 60000); // 60 segundos

    console.log('Featured provider rotation started. Total providers:', this.featuredProviders.length);
  }

  /**
   * Obtener URL de la foto del proveedor destacado
   */
  getFeaturedProviderPhotoUrl(): string {
    if (!this.featuredProvider?.provider) {
      console.warn('getFeaturedProviderPhotoUrl: No hay featuredProvider o provider');
      return 'assets/default-avatar.png';
    }

    const provider = this.featuredProvider.provider as any;
    console.log('getFeaturedProviderPhotoUrl: Provider data:', provider);
    console.log('getFeaturedProviderPhotoUrl: Provider photo:', provider.photo);
    
    // La foto viene directamente como objeto con url
    const photo = provider.photo;
    
    if (!photo) {
      console.warn('getFeaturedProviderPhotoUrl: No hay photo en el provider');
      return 'assets/default-avatar.png';
    }
    
    // Si photo tiene url directamente (estructura de Strapi)
    if (photo.url) {
      let url = photo.url;
      console.log('getFeaturedProviderPhotoUrl: Photo URL encontrada:', url);
      
      // Si ya es una URL completa, retornarla
      if (url.startsWith('http://') || url.startsWith('https://')) {
        console.log('getFeaturedProviderPhotoUrl: URL completa, retornando:', url);
        return url;
      }
      
      // Construir URL completa con apiUrl
      const fullUrl = `${this.configService.apiUrl}${url}`;
      console.log('getFeaturedProviderPhotoUrl: URL construida:', fullUrl);
      return fullUrl;
    }
    
    // Si photo es un objeto con data
    if (photo.data) {
      const photoData = Array.isArray(photo.data) ? photo.data[0] : photo.data;
      if (photoData?.url) {
        let url = photoData.url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        return `${this.configService.apiUrl}${url}`;
      }
    }
    
    console.warn('getFeaturedProviderPhotoUrl: No se pudo extraer URL de la foto:', photo);
    return 'assets/default-avatar.png';
  }

  /**
   * Verificar si hay proveedor destacado
   */
  hasFeaturedProvider(): boolean {
    const hasProvider = this.featuredProvider !== null && 
           this.featuredProvider?.provider !== null && 
           this.featuredProvider?.provider !== undefined;
    
    console.log('hasFeaturedProvider check:', {
      featuredProvider: this.featuredProvider,
      hasProvider: hasProvider,
      providerExists: !!this.featuredProvider?.provider
    });
    
    return hasProvider;
  }

  /**
   * Obtener array de iconos de estrellas para la calificación
   */
  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    
    if (hasHalfStar) {
      stars.push('star_half');
    }
    
    // Completar hasta 5 estrellas
    while (stars.length < 5) {
      stars.push('star_border');
    }
    
    return stars.slice(0, 5);
  }

  /**
   * Truncar descripción si es muy larga
   */
  getTruncatedDescription(description: string, maxLength: number): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
}

