import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StrapiBaseService } from './strapi-base.service';
import { ConfigService } from './config.service';

export interface NewsletterSubscribeRequest {
  email: string;
  source?: string;
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface NewsletterUnsubscribeRequest {
  email: string;
}

export interface NewsletterUnsubscribeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService extends StrapiBaseService {

  constructor(
    protected override http: HttpClient,
    protected override configService: ConfigService
  ) {
    super(http, configService);
  }

  /**
   * Suscribir un email al newsletter
   */
  subscribe(email: string, source: string = 'footer'): Observable<NewsletterSubscribeResponse> {
    const request: NewsletterSubscribeRequest = {
      email: email.trim().toLowerCase(),
      source
    };

    return this.http.post<NewsletterSubscribeResponse>(
      `${this.getApiUrl()}/newsletter-subscriptions/subscribe`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data,
        error: response.error
      })),
      catchError(error => {
        console.error('Error al suscribirse al newsletter:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 409) {
          // Email ya suscrito
          return throwError(() => ({
            success: false,
            message: error.error?.message || 'Este email ya está suscrito a nuestro newsletter.',
            error: 'DUPLICATE_EMAIL'
          }));
        }
        
        if (error.status === 429) {
          // Rate limit excedido
          return throwError(() => ({
            success: false,
            message: error.error?.message || 'Has realizado demasiados intentos. Por favor, espera unos minutos.',
            error: 'RATE_LIMIT_EXCEEDED'
          }));
        }

        if (error.status === 400) {
          // Email inválido
          return throwError(() => ({
            success: false,
            message: error.error?.message || 'El formato del email no es válido.',
            error: 'INVALID_EMAIL'
          }));
        }

        // Error genérico
        const errorMessage = error.error?.message || 
                           'Error al suscribirse al newsletter. Por favor, intenta nuevamente.';
        return throwError(() => ({
          success: false,
          message: errorMessage,
          error: 'UNKNOWN_ERROR'
        }));
      })
    );
  }

  /**
   * Cancelar suscripción al newsletter
   */
  unsubscribe(email: string): Observable<NewsletterUnsubscribeResponse> {
    const request: NewsletterUnsubscribeRequest = {
      email: email.trim().toLowerCase()
    };

    return this.http.post<NewsletterUnsubscribeResponse>(
      `${this.getApiUrl()}/newsletter-subscriptions/unsubscribe`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data,
        error: response.error
      })),
      catchError(error => {
        console.error('Error al cancelar suscripción:', error);
        
        if (error.status === 404) {
          return throwError(() => ({
            success: false,
            message: error.error?.message || 'Este email no está suscrito a nuestro newsletter.',
            error: 'EMAIL_NOT_FOUND'
          }));
        }

        const errorMessage = error.error?.message || 
                           'Error al cancelar la suscripción. Por favor, intenta nuevamente.';
        return throwError(() => ({
          success: false,
          message: errorMessage,
          error: 'UNKNOWN_ERROR'
        }));
      })
    );
  }

  /**
   * Valida un email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
}

