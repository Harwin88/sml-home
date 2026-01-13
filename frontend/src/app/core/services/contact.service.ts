import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = '/api/contact'; // URL del backend (ajustar según configuración)

  constructor(private http: HttpClient) {}

  /**
   * Envía un formulario de contacto
   */
  submitContactForm(formData: ContactFormData): Observable<ContactResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // TODO: Implementar llamada real al backend
    // return this.http.post<ContactResponse>(this.apiUrl, formData, { headers });

    // Por ahora, simulamos una respuesta del servidor
    return this.simulateSubmit(formData);
  }

  /**
   * Simula el envío del formulario (para desarrollo)
   * Eliminar cuando se implemente el backend real
   */
  private simulateSubmit(formData: ContactFormData): Observable<ContactResponse> {
    // Simular llamada al servidor con delay
    return of({
      success: true,
      message: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.',
      ticketId: this.generateTicketId()
    }).pipe(delay(1500)); // Simular latencia de red
  }

  /**
   * Genera un ID de ticket único
   */
  private generateTicketId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `MSL-${timestamp}-${random}`;
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

