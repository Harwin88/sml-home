import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { getApiUrl } from '../config/api.config';
import { ConfigService } from './config.service';
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private tokenKey = 'kapi_auth_token';
  private userKey = 'kapi_user';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    // Cargar usuario del localStorage al iniciar
    this.loadUserFromStorage();
  }

  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    const apiUrl = getApiUrl(this.configService);
    return this.http.post<AuthResponse>(`${apiUrl}/auth/register`, data).pipe(
      tap(response => {
        this.setAuth(response);
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Iniciar sesión
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    const apiUrl = getApiUrl(this.configService);
    return this.http.post<AuthResponse>(`${apiUrl}/auth/login`, data).pipe(
      tap(response => {
        this.setAuth(response);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser$.next(null);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Obtener usuario actual (síncrono)
   */
  getCurrentUserSync(): User | null {
    return this.currentUser$.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser$.value;
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtener headers con autenticación
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      console.log('AuthService.getAuthHeaders: Token encontrado, headers creados');
      return headers;
    }
    console.warn('AuthService.getAuthHeaders: ⚠️ NO HAY TOKEN - retornando headers vacíos');
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Actualizar información del usuario
   */
  refreshUser(): Observable<User> {
    const apiUrl = getApiUrl(this.configService);
    const headers = this.getAuthHeaders();
    
    return this.http.get<User>(`${apiUrl}/users/me`, { headers }).pipe(
      tap(user => {
        this.currentUser$.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }),
      catchError(error => {
        console.error('refreshUser: error al actualizar usuario:', error);
        console.error('refreshUser: status:', error.status);
        console.error('refreshUser: NO se cerrará la sesión automáticamente');
        // NO cerrar sesión automáticamente NUNCA
        // Solo propagar el error para que el componente pueda decidir qué hacer
        return throwError(() => error);
      })
    );
  }

  /**
   * Establecer autenticación
   */
  private setAuth(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.jwt);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUser$.next(response.user);
  }

  /**
   * Cargar usuario del localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser$.next(user);
      } catch (error) {
        console.error('Error al parsear usuario del localStorage:', error);
        this.logout();
      }
    }
  }
}

