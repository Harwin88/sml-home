import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss']
})
export class WelcomeModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  ngOnInit(): void {
    // Cerrar automáticamente después de 8 segundos
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

