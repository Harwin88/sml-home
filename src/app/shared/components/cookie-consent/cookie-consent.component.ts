import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CookieService, CookieConsent } from '../../../core/services/cookie.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;
  showSettings = false;
  
  consent: CookieConsent = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: Date.now()
  };

  constructor(
    public cookieService: CookieService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    // Verificar si ya existe consentimiento
    const existingConsent = this.cookieService.getConsent();
    
    if (!existingConsent) {
      // Mostrar banner después de un pequeño delay
      setTimeout(() => {
        this.showBanner = true;
      }, 1000);
    } else {
      // Si ya dio consentimiento, aplicar configuración
      this.consent = existingConsent;
      this.applyConsent();
    }
  }

  /**
   * Aceptar todas las cookies
   */
  acceptAll(): void {
    this.consent = this.cookieService.getFullConsent();
    this.saveAndClose();
  }

  /**
   * Rechazar cookies opcionales (solo necesarias)
   */
  rejectOptional(): void {
    this.consent = this.cookieService.getDefaultConsent();
    this.saveAndClose();
  }

  /**
   * Mostrar configuración personalizada
   */
  showCustomSettings(): void {
    this.showSettings = true;
  }

  /**
   * Cerrar configuración
   */
  closeSettings(): void {
    this.showSettings = false;
  }

  /**
   * Guardar configuración personalizada
   */
  saveCustomSettings(): void {
    this.saveAndClose();
  }

  /**
   * Toggle de un tipo de cookie
   */
  toggleCookie(type: keyof Omit<CookieConsent, 'timestamp'>): void {
    if (type === 'necessary') {
      return; // Las necesarias no se pueden desactivar
    }
    this.consent[type] = !this.consent[type];
  }

  /**
   * Guardar consentimiento y cerrar banner
   */
  private saveAndClose(): void {
    this.cookieService.saveConsent(this.consent);
    this.applyConsent();
    this.showBanner = false;
    this.showSettings = false;

    // Trackear que el usuario dio consentimiento
    if (this.consent.analytics) {
      this.analyticsService.trackEvent('Cookie Consent', 'Accept', 'User accepted cookies');
    }
  }

  /**
   * Aplicar el consentimiento (activar/desactivar servicios)
   */
  private applyConsent(): void {
    if (this.consent.analytics) {
      this.analyticsService.enableTracking();
      this.loadGoogleAnalytics();
    } else {
      this.analyticsService.disableTracking();
    }

    if (this.consent.marketing) {
      // Aquí cargarías scripts de marketing (Facebook Pixel, etc.)
      console.log('Marketing cookies enabled');
    }

    if (this.consent.preferences) {
      // Aquí cargarías scripts de preferencias
      console.log('Preferences cookies enabled');
    }
  }

  /**
   * Cargar Google Analytics (si está configurado)
   */
  private loadGoogleAnalytics(): void {
    // Aquí cargarías el script de Google Analytics
    // Solo como ejemplo - deberías reemplazar con tu ID real
    const GA_ID = 'G-XXXXXXXXXX'; // Reemplazar con tu Google Analytics ID

    if (typeof (window as any).gtag === 'function') {
      console.log('Google Analytics already loaded');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
    };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    console.log('Google Analytics loaded');
  }

  /**
   * Reabrir el banner (desde configuración)
   */
  reopenBanner(): void {
    this.showBanner = true;
  }
}

