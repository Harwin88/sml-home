import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss']
})
export class WelcomeModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  features: Feature[] = [
    {
      icon: 'verified_user',
      title: 'Verificación Rigurosa',
      description: 'Todos los proveedores pasan por un proceso exhaustivo de validación de experiencia y antecedentes.',
      color: '#0ea5e9'
    },
    {
      icon: 'shield_check',
      title: 'Seguridad Garantizada',
      description: 'Tu seguridad y confianza son nuestra prioridad. Garantizamos los más altos estándares.',
      color: '#10b981'
    },
    {
      icon: 'star_rate',
      title: 'Calidad Certificada',
      description: 'Solo trabajamos con profesionales certificados y con experiencia comprobada.',
      color: '#f59e0b'
    },
    {
      icon: 'support_agent',
      title: 'Soporte 24/7',
      description: 'Nuestro equipo está disponible para ayudarte en cualquier momento que lo necesites.',
      color: '#8b5cf6'
    }
  ];

  ngOnInit(): void {
    // Cerrar automáticamente después de 100 segundos
    setTimeout(() => {
      this.closeModal();
    }, 100000);
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Cerrar si se hace clic en el backdrop (no en el contenido)
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}

