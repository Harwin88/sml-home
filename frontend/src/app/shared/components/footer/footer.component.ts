import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface FooterLink {
  label: string;
  route?: string;
  external?: string;
  icon?: string;
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
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerSections: FooterSection[] = [
    {
      title: 'Navegación',
      links: [
        { label: 'Inicio', route: '/', icon: 'home' },
        { label: 'Buscar Servicios', route: '/search', icon: 'search' },
        { label: 'Sobre Nosotros', route: '/', icon: 'info' },
        { label: 'Trabaja con Nosotros', route: '/', icon: 'work' }
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
      icon: 'facebook',
      url: 'https://facebook.com/mslhogar',
      color: '#1877F2'
    },
    {
      name: 'Instagram',
      icon: 'instagram',
      url: 'https://instagram.com/mslhogar',
      color: '#E4405F'
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      url: 'https://twitter.com/mslhogar',
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: 'linkedin',
      url: 'https://linkedin.com/company/mslhogar',
      color: '#0A66C2'
    },
    {
      name: 'WhatsApp',
      icon: 'whatsapp',
      url: 'https://wa.me/573001234567',
      color: '#25D366'
    }
  ];

  contactInfo = {
    email: 'info@mslhogar.com',
    phone: '+57 300 123 4567',
    address: 'Bogotá, Colombia',
    hours: 'Lun - Vie: 8:00 AM - 6:00 PM'
  };

  features = [
    { icon: 'verified', text: 'Proveedores Verificados' },
    { icon: 'security', text: 'Seguridad Garantizada' },
    { icon: 'support_agent', text: 'Soporte 24/7' },
    { icon: 'star', text: 'Mejor Calificación' }
  ];

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
}

