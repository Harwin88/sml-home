import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ServiceProviderService } from '../../core/services/service-provider.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  isLoading = false;
  error: string | null = null;
  private isLoadingInProgress = false;

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private serviceProviderService: ServiceProviderService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    if (!this.authService.isAuthenticated()) {
      this.isLoading = false;
      this.error = 'Debes iniciar sesión para ver tus favoritos';
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (this.isLoadingInProgress) {
      return;
    }

    this.isLoadingInProgress = true;
    this.isLoading = true;
    this.error = null;

    // Obtener el usuario actual para usar su documentId
    const currentUser = this.authService.getCurrentUserSync();
    
    if (currentUser && (currentUser as any).documentId) {
      // Usar el método con documentId (más simple, sin token)
      this.favoritesService.getFavoritesByDocumentId((currentUser as any).documentId).subscribe({
        next: (favorites) => {
          // El backend ya elimina duplicados, pero asegurar también en frontend
          this.favorites = this.removeDuplicates(Array.isArray(favorites) ? favorites : []);
          this.isLoading = false;
          this.isLoadingInProgress = false;
        },
        error: (error) => {
          console.error('Error al cargar favoritos:', error);
          this.isLoadingInProgress = false;
          // Si falla, intentar con el método de token
          this.loadFavoritesWithToken();
        }
      });
    } else if (currentUser && currentUser.id) {
      // Si no hay documentId pero hay id, intentar obtener documentId primero
      this.authService.refreshUser().subscribe({
        next: (updatedUser) => {
          if ((updatedUser as any)?.documentId) {
            this.isLoadingInProgress = false; // Reset para permitir nueva carga
            this.loadFavorites();
          } else {
            this.loadFavoritesWithToken();
          }
        },
        error: () => {
          this.isLoadingInProgress = false;
          this.loadFavoritesWithToken();
        }
      });
    } else {
      // Si no hay documentId ni id, usar el método con token
      this.loadFavoritesWithToken();
    }
  }

  /**
   * Eliminar duplicados por id o documentId
   */
  private removeDuplicates(favorites: any[]): any[] {
    if (!Array.isArray(favorites) || favorites.length === 0) {
      return [];
    }

    const seen = new Map<string | number, boolean>();
    return favorites.filter((fav) => {
      const id = fav.id ? Number(fav.id) : null;
      const documentId = fav.documentId ? String(fav.documentId) : null;
      
      // Verificar si ya vimos este favorito
      if (id !== null && seen.has(id)) {
        return false;
      }
      if (documentId !== null && seen.has(documentId)) {
        return false;
      }
      
      // Marcar como visto
      if (id !== null) seen.set(id, true);
      if (documentId !== null) seen.set(documentId, true);
      
      return true;
    });
  }

  private loadFavoritesWithToken(): void {
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        // Eliminar duplicados también en este método
        this.favorites = this.removeDuplicates(Array.isArray(favorites) ? favorites : []);
        this.isLoading = false;
        this.isLoadingInProgress = false;
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
        
        if (error.status === 401) {
          this.error = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else {
          this.error = 'Error al cargar tus favoritos. Por favor, intenta de nuevo.';
        }
        this.isLoading = false;
        this.isLoadingInProgress = false;
      }
    });
  }

  removeFavorite(providerId: number): void {
    this.favoritesService.removeFavorite(providerId).subscribe({
      next: () => {
        // Recargar favoritos desde el servidor
        this.loadFavorites();
      },
      error: (error) => {
        console.error('Error al remover favorito:', error);
        alert('Error al remover el favorito. Por favor, intenta de nuevo.');
      }
    });
  }

  getPhotoUrl(provider: any): string {
    if (provider.photo?.url) {
      return this.serviceProviderService.getMediaUrl(provider.photo);
    }
    return 'assets/default-avatar.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/default-avatar.png';
    }
  }

  /**
   * TrackBy function para evitar renderizado duplicado en *ngFor
   */
  trackByProviderId(index: number, provider: any): string | number {
    return provider.documentId || provider.id || index;
  }
}

