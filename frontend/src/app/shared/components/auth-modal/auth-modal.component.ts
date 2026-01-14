import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { GeolocationService } from '../../../core/services/geolocation.service';
import { RegisterRequest, LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  isLoginMode = true;
  registerForm: FormGroup;
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  isGettingLocation = false;
  locationObtained = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private geolocationService: GeolocationService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      latitude: [null],
      longitude: [null]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    // Intentar obtener ubicación automáticamente
    this.getUserLocation();
  }

  /**
   * Obtener ubicación del usuario
   */
  getUserLocation(): void {
    this.isGettingLocation = true;
    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        this.registerForm.patchValue({
          latitude: position.latitude,
          longitude: position.longitude
        });
        this.locationObtained = true;
        this.isGettingLocation = false;
      },
      error: (error) => {
        console.warn('No se pudo obtener la ubicación:', error);
        this.isGettingLocation = false;
        // Continuar sin ubicación
      }
    });
  }

  /**
   * Cambiar entre modo login y registro
   */
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null;
    if (!this.isLoginMode && !this.locationObtained) {
      this.getUserLocation();
    }
  }

  /**
   * Registrar usuario
   */
  onRegister(): void {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.registerForm.value;
    const registerData: RegisterRequest = {
      email: formValue.email,
      phone: formValue.phone,
      latitude: formValue.latitude,
      longitude: formValue.longitude
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success.emit();
        this.closeModal();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error?.message || 'Error al registrar. Por favor, intenta de nuevo.';
      }
    });
  }

  /**
   * Iniciar sesión
   */
  onLogin(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.loginForm.value;
    const loginData: LoginRequest = {
      email: formValue.email,
      phone: formValue.phone
    };

    this.authService.login(loginData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success.emit();
        this.closeModal();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error?.message || 'Credenciales inválidas. Por favor, verifica tus datos.';
      }
    });
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.close.emit();
  }

  /**
   * Marcar todos los campos como touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors['email']) {
        return 'Email inválido';
      }
      if (control.errors['pattern']) {
        return fieldName === 'phone' ? 'Teléfono debe tener 10 dígitos' : 'Formato inválido';
      }
    }
    return '';
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  /**
   * Obtener etiqueta del campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      phone: 'Teléfono'
    };
    return labels[fieldName] || fieldName;
  }
}

