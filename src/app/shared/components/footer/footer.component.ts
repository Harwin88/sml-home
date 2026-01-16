import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewsletterService } from '../../../core/services/newsletter.service';

interface FooterLink {
  label: string;
  route?: string;
  external?: string;
  icon?: string;
  action?: string; // Para acciones como abrir modales
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  icon: string;
  url: string;
  color: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Output() openWelcome = new EventEmitter<void>();
  @Output() openWorkWithUs = new EventEmitter<void>();

  currentYear = new Date().getFullYear();
  
  // Newsletter form
  newsletterEmail = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  
  newsletterState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  newsletterMessage = '';

  footerSections: FooterSection[] = [
    {
      title: 'Navegación',
      links: [
        { label: 'Inicio', route: '/', icon: 'home' },
        { label: 'Buscar Servicios', route: '/search', icon: 'search' },
        { label: 'Sobre Nosotros', action: 'openWelcome', icon: 'info' },
        { label: 'Trabaja con Nosotros', action: 'openWorkWithUs', icon: 'work' }
      ]
    },
    {
      title: 'Servicios Populares',
      links: [
        { label: 'Personal Doméstico', route: '/search', icon: 'cleaning_services' },
        { label: 'Plomería', route: '/search', icon: 'plumbing' },
        { label: 'Electricidad', route: '/search', icon: 'electrical_services' },
        { label: 'Jardinería', route: '/search', icon: 'yard' },
        { label: 'Reparaciones', route: '/search', icon: 'build' }
      ]
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de Ayuda', route: '/help', icon: 'help' },
        { label: 'Preguntas Frecuentes', route: '/help', icon: 'quiz' },
        { label: 'Contacto', route: '/contact', icon: 'contact_mail' },
        { label: 'Reportar Problema', route: '/contact', icon: 'report_problem' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos y Condiciones', route: '/legal/terms', icon: 'description' },
        { label: 'Política de Privacidad', route: '/legal/privacy', icon: 'privacy_tip' },
        { label: 'Política de Cookies', route: '/legal/cookies', icon: 'cookie' },
        { label: 'Aviso Legal', route: '/legal/notice', icon: 'gavel' }
      ]
    }
  ];

  socialLinks: SocialLink[] = [
    {
      name: 'Facebook',
      icon: 'thumb_up',
      url: 'https://facebook.com/kapi',
      color: '#1877F2'
    },
    {
      name: 'Instagram',
      icon: 'photo_camera',
      url: 'https://instagram.com/kapi',
      color: '#E4405F'
    },
    {
      name: 'Twitter',
      icon: 'chat_bubble',
      url: 'https://twitter.com/kapi',
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: 'business_center',
      url: 'https://linkedin.com/company/kapi',
      color: '#0A66C2'
    },
    {
      name: 'WhatsApp',
      icon: 'message',
      url: 'https://wa.me/573001234567',
      color: '#25D366'
    }
  ];

  contactInfo = {
    email: 'info@kapi.help',
    phone: '+57 3126701425',
    address: 'Bogotá, Colombia',
    hours: 'Lun - Vie: 8:00 AM - 6:00 PM'
  };

  features = [
    { icon: 'verified', text: 'Proveedores Verificados' },
    { icon: 'security', text: 'Seguridad Garantizada' },
    { icon: 'support_agent', text: 'Soporte 24/7' },
    { icon: 'star', text: 'Mejor Calificación' }
  ];

  constructor(private newsletterService: NewsletterService) {}

  ngOnInit(): void {
    // Validación en tiempo real del email
    this.newsletterEmail.valueChanges.subscribe(() => {
      if (this.newsletterState === 'error') {
        this.newsletterState = 'idle';
        this.newsletterMessage = '';
      }
    });
  }

  /**
   * Manejar acciones de los enlaces
   */
  handleLinkAction(action: string): void {
    switch (action) {
      case 'openWelcome':
        this.openWelcome.emit();
        break;
      case 'openWorkWithUs':
        this.openWorkWithUs.emit();
        break;
    }
  }

  /**
   * Navegar a una sección externa
   */
  navigateExternal(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Scroll suave hacia arriba
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Obtener ícono/letra para redes sociales
   */
  getSocialIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Facebook': 'f',
      'Instagram': '📷',
      'Twitter': '𝕏',
      'LinkedIn': 'in',
      'WhatsApp': '💬'
    };
    return icons[name] || name.charAt(0);
  }

  /**
   * Suscribirse al newsletter
   */
  subscribeNewsletter(): void {
    // Validar email
    if (this.newsletterEmail.invalid) {
      this.newsletterEmail.markAsTouched();
      this.newsletterState = 'error';
      this.newsletterMessage = 'Por favor, ingresa un email válido.';
      return;
    }

    const email = this.newsletterEmail.value?.trim() || '';
    
    if (!this.newsletterService.isValidEmail(email)) {
      this.newsletterState = 'error';
      this.newsletterMessage = 'El formato del email no es válido.';
      return;
    }

    // Cambiar estado a loading
    this.newsletterState = 'loading';
    this.newsletterMessage = '';

    // Llamar al servicio
    this.newsletterService.subscribe(email, 'footer').subscribe({
      next: (response) => {
        this.newsletterState = 'success';
        this.newsletterMessage = response.message || '¡Te has suscrito exitosamente!';
        
        // Limpiar el formulario después de 3 segundos
        setTimeout(() => {
          this.newsletterEmail.reset();
          this.newsletterState = 'idle';
          this.newsletterMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.newsletterState = 'error';
        
        // Manejar diferentes tipos de errores
        if (error.error === 'DUPLICATE_EMAIL') {
          this.newsletterMessage = 'Este email ya está suscrito a nuestro newsletter.';
        } else if (error.error === 'RATE_LIMIT_EXCEEDED') {
          this.newsletterMessage = 'Has realizado demasiados intentos. Por favor, espera unos minutos.';
        } else if (error.error === 'INVALID_EMAIL') {
          this.newsletterMessage = 'El formato del email no es válido.';
        } else {
          this.newsletterMessage = error.message || 'Error al suscribirse. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Verificar si el email es válido
   */
  isEmailValid(): boolean {
    return this.newsletterEmail.valid && this.newsletterEmail.touched;
  }

  /**
   * Verificar si el botón debe estar deshabilitado
   */
  isSubscribeDisabled(): boolean {
    return this.newsletterState === 'loading' || 
           this.newsletterEmail.invalid || 
           !this.newsletterEmail.value?.trim();
  }
}

