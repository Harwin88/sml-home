import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap, timeout, retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  source?: 'gps' | 'ip' | 'manual';
  address?: string;
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

  constructor(private http: HttpClient) {
    // Intentar cargar la ubicación guardada en localStorage
    this.loadSavedLocation();
  }

  /**
   * Obtener la ubicación actual del usuario con fallback automático
   */
  getCurrentPosition(options?: PositionOptions): Observable<GeolocationPosition> {
    this.isGettingLocation$.next(true);

    // Primero intentar con GPS
    return this.getCurrentPositionGPS(options).pipe(
      catchError((gpsError) => {
        console.warn('GPS falló, intentando con IP:', gpsError);
        // Si falla GPS, intentar con IP
        return this.getCurrentPositionByIP().pipe(
          catchError((ipError) => {
            this.isGettingLocation$.next(false);
            return throwError(() => ({
              code: -2,
              message: 'No se pudo obtener la ubicación. Por favor, ingresa tu dirección manualmente.'
            }));
          })
        );
      })
    );
  }

  /**
   * Obtener ubicación usando GPS del navegador
   */
  private getCurrentPositionGPS(options?: PositionOptions): Observable<GeolocationPosition> {
    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject({
            code: -1,
            message: 'Geolocalización no es compatible con este navegador'
          });
          return;
        }

        // Opciones mejoradas con timeout más largo y mejor precisión
        const defaultOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 20000, // 20 segundos (aumentado)
          maximumAge: 600000 // 10 minutos (aumentado)
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const geoPosition: GeolocationPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              source: 'gps'
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
    ).pipe(
      timeout(25000), // Timeout adicional en RxJS
      retry({
        count: 2,
        delay: 1000
      })
    );
  }

  /**
   * Obtener ubicación aproximada usando la IP (fallback)
   */
  private getCurrentPositionByIP(): Observable<GeolocationPosition> {
    // Usar servicio gratuito de geolocalización por IP
    // ip-api.com es gratuito y no requiere API key
    return this.http.get<any>('http://ip-api.com/json/?fields=status,message,lat,lon,city,region,country').pipe(
      timeout(10000),
      map((response) => {
        if (response.status === 'success') {
          const geoPosition: GeolocationPosition = {
            latitude: response.lat,
            longitude: response.lon,
            accuracy: 5000, // Baja precisión para IP (~5km)
            timestamp: Date.now(),
            source: 'ip',
            address: `${response.city}, ${response.region}, ${response.country}`
          };

          this.saveLocation(geoPosition);
          this.currentPosition$.next(geoPosition);
          this.isGettingLocation$.next(false);
          return geoPosition;
        } else {
          throw new Error(response.message || 'Error al obtener ubicación por IP');
        }
      }),
      catchError((error) => {
        this.isGettingLocation$.next(false);
        return throwError(() => ({
          code: -3,
          message: 'No se pudo obtener la ubicación aproximada por IP'
        }));
      })
    );
  }

  /**
   * Establecer ubicación manualmente (por dirección)
   */
  setManualLocation(latitude: number, longitude: number, address?: string): void {
    const geoPosition: GeolocationPosition = {
      latitude,
      longitude,
      accuracy: 100, // Asumimos buena precisión para ubicación manual
      timestamp: Date.now(),
      source: 'manual',
      address
    };

    this.saveLocation(geoPosition);
    this.currentPosition$.next(geoPosition);
  }

  /**
   * Geocodificar una dirección (convertir dirección a coordenadas)
   * Usando Nominatim (OpenStreetMap) - servicio gratuito
   */
  geocodeAddress(address: string): Observable<GeolocationPosition> {
    this.isGettingLocation$.next(true);
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    return this.http.get<any[]>(url, {
      headers: {
        'User-Agent': 'kapi-App' // Requerido por Nominatim
      }
    }).pipe(
      timeout(10000),
      map((results) => {
        if (results && results.length > 0) {
          const result = results[0];
          const geoPosition: GeolocationPosition = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            accuracy: 100,
            timestamp: Date.now(),
            source: 'manual',
            address: result.display_name
          };

          this.saveLocation(geoPosition);
          this.currentPosition$.next(geoPosition);
          this.isGettingLocation$.next(false);
          return geoPosition;
        } else {
          throw new Error('No se encontró la dirección');
        }
      }),
      catchError((error) => {
        this.isGettingLocation$.next(false);
        return throwError(() => ({
          code: -4,
          message: 'No se pudo encontrar la dirección. Por favor, verifica e intenta de nuevo.'
        }));
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
   * Obtener nombre de la ubicación (reverse geocoding)
   */
  reverseGeocode(latitude: number, longitude: number): Observable<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    return this.http.get<any>(url, {
      headers: {
        'User-Agent': 'MSL-Hogar-App'
      }
    }).pipe(
      timeout(10000),
      map((response) => {
        if (response && response.display_name) {
          return response.display_name;
        }
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }),
      catchError(() => {
        return of(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      })
    );
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

