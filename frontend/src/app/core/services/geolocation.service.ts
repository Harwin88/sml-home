import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private currentPosition$ = new BehaviorSubject<GeolocationPosition | null>(null);
  private isGettingLocation$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Intentar cargar la ubicación guardada en localStorage
    this.loadSavedLocation();
  }

  /**
   * Obtener la ubicación actual del usuario
   */
  getCurrentPosition(options?: PositionOptions): Observable<GeolocationPosition> {
    this.isGettingLocation$.next(true);

    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject({
            code: -1,
            message: 'Geolocalización no es compatible con este navegador'
          });
          return;
        }

        const defaultOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const geoPosition: GeolocationPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };

            // Guardar en localStorage
            this.saveLocation(geoPosition);
            this.currentPosition$.next(geoPosition);
            this.isGettingLocation$.next(false);
            resolve(geoPosition);
          },
          (error) => {
            this.isGettingLocation$.next(false);
            const geoError: GeolocationError = {
              code: error.code,
              message: this.getErrorMessage(error.code)
            };
            reject(geoError);
          },
          { ...defaultOptions, ...options }
        );
      })
    );
  }

  /**
   * Observar cambios en la ubicación actual
   */
  getCurrentPositionObservable(): Observable<GeolocationPosition | null> {
    return this.currentPosition$.asObservable();
  }

  /**
   * Observar el estado de obtención de ubicación
   */
  getIsGettingLocationObservable(): Observable<boolean> {
    return this.isGettingLocation$.asObservable();
  }

  /**
   * Obtener la ubicación actual (síncrono, si está disponible)
   */
  getCurrentPositionSync(): GeolocationPosition | null {
    return this.currentPosition$.value;
  }

  /**
   * Limpiar la ubicación guardada
   */
  clearLocation(): void {
    localStorage.removeItem('user_location');
    this.currentPosition$.next(null);
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   * Retorna la distancia en kilómetros
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
  }

  /**
   * Verificar si el navegador soporta geolocalización
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Guardar ubicación en localStorage
   */
  private saveLocation(position: GeolocationPosition): void {
    try {
      localStorage.setItem('user_location', JSON.stringify({
        ...position,
        savedAt: Date.now()
      }));
    } catch (error) {
      console.warn('No se pudo guardar la ubicación en localStorage:', error);
    }
  }

  /**
   * Cargar ubicación guardada de localStorage
   */
  private loadSavedLocation(): void {
    try {
      const saved = localStorage.getItem('user_location');
      if (saved) {
        const location = JSON.parse(saved);
        // Verificar que la ubicación no sea muy antigua (más de 1 hora)
        const oneHour = 60 * 60 * 1000;
        if (location.savedAt && (Date.now() - location.savedAt) < oneHour) {
          this.currentPosition$.next({
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp
          });
        } else {
          localStorage.removeItem('user_location');
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar la ubicación guardada:', error);
    }
  }

  /**
   * Convertir grados a radianes
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Obtener mensaje de error basado en el código
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permiso denegado para acceder a la ubicación';
      case 2:
        return 'No se pudo determinar la ubicación';
      case 3:
        return 'Tiempo de espera agotado al obtener la ubicación';
      default:
        return 'Error desconocido al obtener la ubicación';
    }
  }
}

