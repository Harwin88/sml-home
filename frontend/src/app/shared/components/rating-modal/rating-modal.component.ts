import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss']
})
export class RatingModalComponent implements OnInit {
  @Input() providerName: string = '';
  @Input() providerId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  ratingForm: FormGroup;
  selectedRating: number = 0;
  hoveredRating: number = 0;
  submitting = false;

  constructor(private fb: FormBuilder) {
    this.ratingForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      reviewerName: ['', [Validators.required, Validators.minLength(2)]],
      reviewerEmail: ['', [Validators.required, Validators.email]],
      reviewerPhone: ['']
    });
  }

  ngOnInit(): void {
    // Sincronizar selectedRating con el form control
    this.ratingForm.get('rating')?.valueChanges.subscribe(value => {
      this.selectedRating = value;
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.ratingForm.patchValue({ rating });
  }

  onStarHover(rating: number): void {
    if (!this.submitting) {
      this.hoveredRating = rating;
    }
  }

  onStarLeave(): void {
    this.hoveredRating = 0;
  }

  closeModal(): void {
    if (!this.submitting) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('rating-modal-backdrop') && !this.submitting) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.ratingForm.valid && !this.submitting) {
      this.submitting = true;
      const formValue = this.ratingForm.value;
      const reviewData = {
        serviceProviderId: this.providerId,
        rating: formValue.rating,
        comment: formValue.comment.trim(),
        reviewerName: formValue.reviewerName.trim(),
        reviewerEmail: formValue.reviewerEmail.trim(),
        reviewerPhone: formValue.reviewerPhone?.trim() || undefined
      };
      this.submit.emit(reviewData);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.ratingForm.controls).forEach(key => {
        this.ratingForm.get(key)?.markAsTouched();
      });
    }
  }

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ratingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.ratingForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return 'Debes seleccionar una calificación';
    }
    return '';
  }

  resetForm(): void {
    this.submitting = false;
    this.selectedRating = 0;
    this.hoveredRating = 0;
    this.ratingForm.reset();
    this.ratingForm.patchValue({ rating: 0 });
  }
}

