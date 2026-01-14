import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { StrapiBaseService } from './strapi-base.service';
import { ConfigService } from './config.service';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  contactType: string;
  subject: string;
  message: string;
  acceptTerms: boolean;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

interface StrapiContactResponse {
  success: boolean;
  message: string;
  ticketId: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService extends StrapiBaseService {

  constructor(
    protected override http: HttpClient,
    protected override configService: ConfigService
  ) {
    super(http, configService);
  }

  /**
   * Envía un formulario de contacto al backend
   */
  submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
    // Filtrar acceptTerms ya que es solo para validación del cliente
    const { acceptTerms, ...dataToSend } = formData;
    
    // Enviar al endpoint de Strapi
    // getApiUrl() ya incluye '/api', solo agregar el endpoint
    return this.http.post<StrapiContactResponse>(
      `${this.getApiUrl()}/contact-forms`,
      { data: dataToSend },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        ticketId: response.ticketId
      })),
      catchError(error => {
        console.error('Error al enviar formulario de contacto:', error);
        const errorMessage = error.error?.message || 
                           error.error?.error?.message || 
                           'Error al enviar el formulario. Por favor, intenta nuevamente.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Genera un ID de ticket único
   */
  private generateTicketId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `KAPI-${timestamp}-${random}`;
  }

  /**
   * Envía un email directo
   * Abre el cliente de email del usuario con datos prellenados
   */
  sendDirectEmail(to: string, subject: string = '', body: string = ''): void {
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  }

  /**
   * Abre WhatsApp con un mensaje prellenado
   */
  openWhatsApp(phone: string, message: string = ''): void {
    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}${message ? '?text=' + encodeURIComponent(message) : ''}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * Guarda el formulario en localStorage como borrador
   */
  saveDraft(formData: Partial<ContactFormData>): void {
    try {
      localStorage.setItem('contact_form_draft', JSON.stringify(formData));
    } catch (error) {
      console.error('Error al guardar borrador:', error);
    }
  }

  /**
   * Obtiene el borrador guardado del formulario
   */
  getDraft(): Partial<ContactFormData> | null {
    try {
      const draft = localStorage.getItem('contact_form_draft');
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Error al obtener borrador:', error);
      return null;
    }
  }

  /**
   * Elimina el borrador guardado
   */
  clearDraft(): void {
    try {
      localStorage.removeItem('contact_form_draft');
    } catch (error) {
      console.error('Error al eliminar borrador:', error);
    }
  }

  /**
   * Valida un email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida un número de teléfono colombiano
   */
  isValidColombianPhone(phone: string): boolean {
    // Acepta formatos: 3001234567, 300-123-4567, +57 300 123 4567, etc.
    const cleanPhone = phone.replace(/\D/g, '');
    // Números de celular en Colombia: 10 dígitos comenzando con 3
    // O 12 dígitos comenzando con 57 (código de país)
    return /^3\d{9}$/.test(cleanPhone) || /^57\d{10}$/.test(cleanPhone);
  }
}

