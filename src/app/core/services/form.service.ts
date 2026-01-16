import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { StrapiBaseService } from './strapi-base.service';
import { CreateFormDTO, Form } from '../models/form.model';
import { StrapiSingleResponse } from '../models/strapi-response.model';

@Injectable({
  providedIn: 'root'
})
export class FormService extends StrapiBaseService {
  private readonly endpoint = '/forms';

  /**
   * Obtener la IP pública del usuario desde el navegador
   */
  private getUserIp(): Observable<string> {
    // Intentar obtener la IP desde ipify
    return this.http.get<{ ip: string }>('https://api.ipify.org?format=json').pipe(
      map(response => response.ip),
      catchError(() => {
        // Si falla, retornar 'unknown'
        console.warn('No se pudo obtener la IP del usuario');
        return of('unknown');
      })
    );
  }

  /**
   * Obtener el user agent del navegador
   */
  private getUserAgent(): string {
    return navigator.userAgent || 'unknown';
  }

  /**
   * Enviar un formulario al endpoint POST /api/forms
   */
  submitForm(formData: CreateFormDTO): Observable<Form> {
    // Obtener IP y userAgent antes de enviar
    return this.getUserIp().pipe(
      switchMap((ipAddress) => {
        const formPayload = {
          formType: formData.formType || 'general',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject || undefined,
          message: formData.message,
          serviceProvider: formData.serviceProvider || undefined,
          ipAddress: ipAddress || formData.ipAddress || 'unknown',
          userAgent: this.getUserAgent() || formData.userAgent || 'unknown',
          submittedAt: new Date().toISOString()
        };

        return this.create<Form>(this.endpoint, formPayload).pipe(
          map(response => response.data)
        );
      })
    );
  }
}

