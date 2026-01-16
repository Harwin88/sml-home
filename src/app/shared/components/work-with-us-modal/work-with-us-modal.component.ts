import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormService } from '../../../core/services/form.service';
import { FormType } from '../../../core/models/form.model';

@Component({
  selector: 'app-work-with-us-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './work-with-us-modal.component.html',
  styleUrls: ['./work-with-us-modal.component.scss']
})
export class WorkWithUsModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  
  formGroup: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;

  formTypes: { value: FormType; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'contact', label: 'Contacto' },
    { value: 'service-request', label: 'Solicitud de Servicio' },
    { value: 'quote-request', label: 'Solicitud de Cotización' }
  ];

  constructor(
    private fb: FormBuilder,
    private formService: FormService
  ) {
    this.formGroup = this.fb.group({
      formType: ['general', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Cerrar con ESC
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  private handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !this.isSubmitting) {
      this.closeModal();
    }
  };

  closeModal(): void {
    if (!this.isSubmitting) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.formGroup.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const formData = this.formGroup.value;

    this.formService.submitForm(formData).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.isSubmitting = false;
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = error?.error?.error?.message || 'Error al enviar el formulario. Por favor, intenta nuevamente.';
        console.error('Error submitting form:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors['email']) {
        return 'Email inválido';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${minLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      email: 'Email',
      phone: 'Teléfono',
      subject: 'Asunto',
      message: 'Mensaje',
      formType: 'Tipo de formulario'
    };
    return labels[fieldName] || fieldName;
  }

  hasError(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }
}

