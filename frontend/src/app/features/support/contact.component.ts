import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { AnalyticsService } from '../../core/services/analytics.service';

interface ContactInfo {
  icon: string;
  title: string;
  value: string;
  link?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./support.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  submitted = false;
  loading = false;
  showSuccessMessage = false;
  successMessage = '';
  ticketId = '';
  errorMessage = '';

  contactTypes = [
    { value: 'general', label: 'Consulta General' },
    { value: 'technical', label: 'Problema Técnico' },
    { value: 'billing', label: 'Consulta de Pagos' },
    { value: 'provider', label: 'Problema con Proveedor' },
    { value: 'account', label: 'Problema con mi Cuenta' },
    { value: 'suggestion', label: 'Sugerencia o Feedback' },
    { value: 'other', label: 'Otro' }
  ];

  contactInfo: ContactInfo[] = [
    {
      icon: 'email',
      title: 'Email',
      value: 'soporte&#64;kapi.help',
      link: 'mailto:soporte@kapi.help'
    },
    {
      icon: 'phone',
      title: 'Teléfono',
      value: '+57 300 123 4567',
      link: 'tel:+573001234567'
    },
    {
      icon: 'message',
      title: 'WhatsApp',
      value: '+57 300 123 4567',
      link: 'https://wa.me/573001234567'
    },
    {
      icon: 'location_on',
      title: 'Dirección',
      value: 'Bogotá, Colombia'
    },
    {
      icon: 'schedule',
      title: 'Horario',
      value: 'Lun - Vie: 8:00 AM - 6:00 PM'
    }
  ];

  private draftInterval: any;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private analytics: AnalyticsService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      contactType: ['general', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(20)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Cargar borrador si existe
    const draft = this.contactService.getDraft();
    if (draft) {
      this.contactForm.patchValue(draft);
    }

    // Guardar borrador automáticamente cada 30 segundos
    this.draftInterval = setInterval(() => {
      if (this.contactForm.dirty && !this.loading) {
        this.contactService.saveDraft(this.contactForm.value);
      }
    }, 30000);

    // Track page view
    this.analytics.trackPageView('/contact', 'Contacto');
  }

  ngOnDestroy(): void {
    // Limpiar intervalo de guardado de borrador
    if (this.draftInterval) {
      clearInterval(this.draftInterval);
    }
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.contactForm.invalid) {
      return;
    }

    this.loading = true;

    // Enviar formulario usando el servicio
    this.contactService.submitContactForm(this.contactForm.value).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);
        
        // Track evento de envío exitoso
        this.analytics.trackFormSubmit('contact', true);
        this.analytics.trackEvent('Contact Form', 'Submit', this.contactForm.value.contactType);

        this.loading = false;
        this.showSuccessMessage = true;
        this.successMessage = response.message;
        this.ticketId = response.ticketId || '';
        
        // Limpiar borrador
        this.contactService.clearDraft();
        
        // Resetear formulario
        this.contactForm.reset({
          contactType: 'general',
          acceptTerms: false
        });
        this.submitted = false;

        // Ocultar mensaje de éxito después de 8 segundos
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.successMessage = '';
          this.ticketId = '';
        }, 8000);
      },
      error: (error) => {
        console.error('❌ Error al enviar formulario:', error);
        
        // Track evento de error
        this.analytics.trackFormSubmit('contact', false);
        this.analytics.trackEvent('Contact Form', 'Error', error.message || 'Unknown error');

        this.loading = false;
        this.errorMessage = error.message || 'Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente o contáctanos directamente.';
        
        // Ocultar mensaje de error después de 10 segundos
        setTimeout(() => {
          this.errorMessage = '';
        }, 10000);
      }
    });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }
}

