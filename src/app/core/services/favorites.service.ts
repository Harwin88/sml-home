import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { getApiUrl } from '../config/api.config';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Cache local de IDs de favoritos para actualizar el UI inmediatamente
  private favoriteIds = new Set<number>();

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService
  ) {
    // Sincronizar el cache cada vez que cambie el usuario actual
    this.authService.getCurrentUser().subscribe(user => {
      this.syncFavoritesFromUser(user);
      
      // Si hay usuario con documentId, cargar favoritos para actualizar el cache
      if (user && (user as any).documentId) {
        this.loadFavoritesToCache((user as any).documentId);
      }
    });
  }

  /**
   * Cargar favoritos al cache interno (sin exponer Observable)
   */
  private loadFavoritesToCache(documentId: string): void {
    this.getFavoritesByDocumentId(documentId).subscribe({
      next: (favorites) => {
        // Actualizar el cache con los IDs de los favoritos
        this.favoriteIds.clear();
        if (Array.isArray(favorites)) {
          for (const fav of favorites) {
            const idNum = fav && fav.id ? Number(fav.id) : NaN;
            if (!isNaN(idNum)) {
              this.favoriteIds.add(idNum);
            }
          }
        }
        console.log('FavoritesService: Cache actualizado con', this.favoriteIds.size, 'favoritos');
      },
      error: (error) => {
        console.error('FavoritesService: Error al cargar favoritos al cache:', error);
      }
    });
  }

  /**
   * Sincronizar Set local de favoritos desde el usuario
   */
  private syncFavoritesFromUser(user: any | null): void {
    this.favoriteIds.clear();
    if (user && Array.isArray(user.favorites)) {
      for (const fav of user.favorites) {
        const idNum = fav && fav.id ? Number(fav.id) : NaN;
        if (!isNaN(idNum)) {
          this.favoriteIds.add(idNum);
        }
      }
    }
  }

  /**
   * Agregar proveedor a favoritos (sin JWT, usando id/documentId de usuario)
   */
  addFavorite(providerId: number): Observable<any> {
    const apiUrl = getApiUrl(this.configService);
    const url = `${apiUrl}/users/favorites/${providerId}`;

    const user = this.authService.getCurrentUserSync();
    if (!user) {
      console.error('FavoritesService.addFavorite: No hay usuario autenticado');
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    const body: any = {};
    if ((user as any).documentId) {
      body.userDocumentId = (user as any).documentId;
    } else if (user.id) {
      body.userId = user.id;
    } else {
      console.error('FavoritesService.addFavorite: Usuario sin id/documentId');
      return throwError(() => new Error('Usuario sin identificador válido'));
    }

    console.log('FavoritesService.addFavorite: URL:', url);
    console.log('FavoritesService.addFavorite: providerId:', providerId);
    console.log('FavoritesService.addFavorite: body:', body);
    
    return this.http.post(url, body).pipe(
      tap(() => {
        console.log('FavoritesService.addFavorite: Éxito al agregar favorito');
        // Actualizar cache local inmediatamente
        this.favoriteIds.add(providerId);
        // Actualizar usuario después de agregar favorito
        this.authService.refreshUser().subscribe();
      }),
      catchError(error => {
        console.error('FavoritesService.addFavorite: Error al agregar favorito:', error);
        console.error('FavoritesService.addFavorite: Status:', error.status);
        console.error('FavoritesService.addFavorite: Error completo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remover proveedor de favoritos (sin JWT, usando id/documentId de usuario)
   */
  removeFavorite(providerId: number): Observable<any> {
    const apiUrl = getApiUrl(this.configService);

    const user = this.authService.getCurrentUserSync();
    if (!user) {
      console.error('FavoritesService.removeFavorite: No hay usuario autenticado');
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    // Construir query params para DELETE (ya que el body puede no parsearse)
    let url = `${apiUrl}/users/favorites/${providerId}?`;
    if ((user as any).documentId) {
      url += `userDocumentId=${encodeURIComponent((user as any).documentId)}`;
    } else if (user.id) {
      url += `userId=${encodeURIComponent(user.id)}`;
    } else {
      console.error('FavoritesService.removeFavorite: Usuario sin id/documentId');
      return throwError(() => new Error('Usuario sin identificador válido'));
    }

    console.log('FavoritesService.removeFavorite: URL:', url);
    console.log('FavoritesService.removeFavorite: providerId:', providerId);
    
    return this.http.delete(url).pipe(
      tap(() => {
        console.log('FavoritesService.removeFavorite: Éxito al remover favorito');
        // Actualizar cache local inmediatamente
        this.favoriteIds.delete(providerId);
        // Actualizar usuario después de remover favorito
        this.authService.refreshUser().subscribe();
      }),
      catchError(error => {
        console.error('FavoritesService.removeFavorite: Error al remover favorito:', error);
        console.error('FavoritesService.removeFavorite: Status:', error.status);
        console.error('FavoritesService.removeFavorite: Error completo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener favoritos del usuario usando documentId
   */
  getFavoritesByDocumentId(documentId: string): Observable<any[]> {
    const apiUrl = getApiUrl(this.configService);
    const url = `${apiUrl}/users/${documentId}/favorites?populate=*`;
    
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error al obtener favoritos por documentId:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener favoritos del usuario (usando documentId, sin JWT)
   * Se usa como fallback desde el componente si falla la otra llamada.
   */
  getFavorites(): Observable<any[]> {
    const user = this.authService.getCurrentUserSync();
    if (!user || !(user as any).documentId) {
      console.error('FavoritesService.getFavorites: No hay documentId de usuario');
      return throwError(() => new Error('No hay documentId de usuario'));
    }

    return this.getFavoritesByDocumentId((user as any).documentId);
  }

  /**
   * Verificar si un proveedor está en favoritos
   */
  isFavorite(providerId: number): boolean {
    // Primero usar el cache local, que se actualiza al agregar/remover
    if (this.favoriteIds.has(providerId)) {
      return true;
    }

    const user = this.authService.getCurrentUserSync();
    if (!user || !user.favorites) {
      return false;
    }
    // Verificar tanto por id como por documentId
    return user.favorites.some((fav: any) => 
      fav.id === providerId || fav.documentId === providerId || Number(fav.id) === providerId
    );
  }
}

