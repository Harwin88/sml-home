import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CookieService } from './cookie.service';
import { filter } from 'rxjs/operators';

export interface UserEvent {
  eventType: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  metadata?: { [key: string]: any };
}

export interface PageView {
  url: string;
  title: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  timeOnPage?: number;
  referrer?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  events: number;
  deviceType: string;
  browser: string;
  os: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private events: UserEvent[] = [];
  private pageViews: PageView[] = [];
  private currentPageStartTime: number = Date.now();
  private readonly MAX_EVENTS_IN_MEMORY = 100;
  private readonly SESSION_STORAGE_KEY = 'msl_analytics_session';
  private readonly USER_ID_KEY = 'msl_user_id';

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = this.getUserId();
    this.initializeTracking();
  }

  /**
   * Inicializar tracking automático
   */
  private initializeTracking(): void {
    // Solo iniciar si el usuario dio consentimiento para analytics
    if (!this.cookieService.isAllowed('analytics')) {
      console.log('Analytics tracking disabled - no user consent');
      return;
    }

    // Trackear cambios de página
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.trackPageView(event.urlAfterRedirects);
      });

    // Trackear tiempo en página antes de cerrar
    window.addEventListener('beforeunload', () => {
      this.trackPageTimeBeforeLeave();
    });

    // Trackear clicks en elementos importantes
    this.setupClickTracking();

    // Guardar sesión periódicamente
    this.startSessionSaver();
  }

  /**
   * Obtener o crear session ID
   */
  private getOrCreateSessionId(): string {
    const stored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    
    if (stored) {
      try {
        const session = JSON.parse(stored);
        return session.sessionId;
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }

    const newSessionId = this.generateUniqueId();
    this.saveSession(newSessionId);
    return newSessionId;
  }

  /**
   * Obtener user ID (si existe)
   */
  private getUserId(): string | null {
    // Primero intentar desde localStorage
    const storedUserId = localStorage.getItem(this.USER_ID_KEY);
    
    if (storedUserId) {
      return storedUserId;
    }

    // Si no existe, crear uno nuevo
    const newUserId = this.generateUniqueId();
    localStorage.setItem(this.USER_ID_KEY, newUserId);
    return newUserId;
  }

  /**
   * Generar ID único
   */
  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Guardar sesión
   */
  private saveSession(sessionId: string): void {
    const session: UserSession = {
      sessionId,
      userId: this.userId || undefined,
      startTime: Date.now(),
      pageViews: this.pageViews.length,
      events: this.events.length,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS()
    };

    sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Iniciar guardado periódico de sesión
   */
  private startSessionSaver(): void {
    setInterval(() => {
      this.saveSession(this.sessionId);
      this.sendEventsToServer();
    }, 30000); // Cada 30 segundos
  }

  /**
   * Trackear vista de página
   */
  trackPageView(url: string, title?: string): void {
    if (!this.cookieService.isAllowed('analytics')) {
      return;
    }

    // Calcular tiempo en página anterior
    const timeOnPreviousPage = Date.now() - this.currentPageStartTime;
    if (this.pageViews.length > 0) {
      this.pageViews[this.pageViews.length - 1].timeOnPage = timeOnPreviousPage;
    }

    const pageView: PageView = {
      url,
      title: title || document.title,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
      referrer: document.referrer || undefined
    };

    this.pageViews.push(pageView);
    this.currentPageStartTime = Date.now();

    console.log('📊 Page View:', pageView);

    // Enviar a Google Analytics si está disponible
    this.sendToGoogleAnalytics('page_view', {
      page_path: url,
      page_title: title || document.title
    });
  }

  /**
   * Trackear tiempo en página antes de salir
   */
  private trackPageTimeBeforeLeave(): void {
    if (this.pageViews.length > 0) {
      const timeOnPage = Date.now() - this.currentPageStartTime;
      this.pageViews[this.pageViews.length - 1].timeOnPage = timeOnPage;
      
      // Enviar datos finales al servidor
      this.sendEventsToServer();
    }
  }

  /**
   * Trackear evento personalizado
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: { [key: string]: any }
  ): void {
    if (!this.cookieService.isAllowed('analytics')) {
      return;
    }

    const event: UserEvent = {
      eventType: 'custom',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
      page: window.location.pathname,
      metadata
    };

    this.events.push(event);

    // Limitar eventos en memoria
    if (this.events.length > this.MAX_EVENTS_IN_MEMORY) {
      this.events.shift();
    }

    console.log('📊 Event:', event);

    // Enviar a Google Analytics
    this.sendToGoogleAnalytics(action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  /**
   * Trackear click en botón
   */
  trackButtonClick(buttonName: string, location: string): void {
    this.trackEvent('Button', 'Click', `${buttonName} - ${location}`);
  }

  /**
   * Trackear búsqueda
   */
  trackSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent('Search', 'Query', searchTerm, resultsCount);
  }

  /**
   * Trackear formulario
   */
  trackFormSubmit(formName: string, success: boolean): void {
    this.trackEvent('Form', success ? 'Submit Success' : 'Submit Error', formName);
  }

  /**
   * Trackear contacto con proveedor
   */
  trackProviderContact(providerId: string, contactMethod: string): void {
    this.trackEvent('Provider', 'Contact', contactMethod, undefined, {
      providerId,
      timestamp: Date.now()
    });
  }

  /**
   * Trackear vista de perfil de proveedor
   */
  trackProviderView(providerId: string, providerName: string): void {
    this.trackEvent('Provider', 'View', providerName, undefined, {
      providerId
    });
  }

  /**
   * Trackear calificación
   */
  trackRating(providerId: string, rating: number): void {
    this.trackEvent('Provider', 'Rate', providerId, rating);
  }

  /**
   * Setup de tracking de clicks
   */
  private setupClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Trackear clicks en enlaces importantes
      if (target.tagName === 'A' && target.getAttribute('data-track')) {
        const trackName = target.getAttribute('data-track');
        this.trackEvent('Link', 'Click', trackName || target.textContent || 'Unknown');
      }

      // Trackear clicks en botones
      if (target.tagName === 'BUTTON' && target.getAttribute('data-track')) {
        const trackName = target.getAttribute('data-track');
        this.trackButtonClick(trackName || target.textContent || 'Unknown', window.location.pathname);
      }
    });
  }

  /**
   * Enviar eventos al servidor (implementar según backend)
   */
  private sendEventsToServer(): void {
    if (this.events.length === 0 && this.pageViews.length === 0) {
      return;
    }

    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      pageViews: this.pageViews,
      timestamp: Date.now()
    };

    // TODO: Implementar llamada HTTP al backend
    console.log('📤 Sending analytics to server:', data);

    // Aquí irían las llamadas HTTP:
    // this.http.post('/api/analytics/events', data).subscribe();

    // Por ahora, solo guardar en localStorage para debugging
    const existingData = localStorage.getItem('msl_analytics_data');
    const allData = existingData ? JSON.parse(existingData) : [];
    allData.push(data);
    
    // Mantener solo los últimos 10 envíos
    if (allData.length > 10) {
      allData.shift();
    }
    
    localStorage.setItem('msl_analytics_data', JSON.stringify(allData));

    // Limpiar eventos enviados
    this.events = [];
  }

  /**
   * Enviar a Google Analytics (si está configurado)
   */
  private sendToGoogleAnalytics(eventName: string, params?: any): void {
    // Verificar si gtag está disponible
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    }
  }

  /**
   * Obtener tipo de dispositivo
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Obtener navegador
   */
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'IE';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    return 'Unknown';
  }

  /**
   * Obtener sistema operativo
   */
  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  }

  /**
   * Obtener resumen de la sesión actual
   */
  getSessionSummary(): UserSession {
    return {
      sessionId: this.sessionId,
      userId: this.userId || undefined,
      startTime: this.currentPageStartTime,
      pageViews: this.pageViews.length,
      events: this.events.length,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS()
    };
  }

  /**
   * Limpiar todos los datos de analytics
   */
  clearAllData(): void {
    this.events = [];
    this.pageViews = [];
    sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    localStorage.removeItem('msl_analytics_data');
  }

  /**
   * Habilitar tracking (cuando el usuario da consentimiento)
   */
  enableTracking(): void {
    console.log('✅ Analytics tracking enabled');
    this.initializeTracking();
  }

  /**
   * Deshabilitar tracking
   */
  disableTracking(): void {
    console.log('❌ Analytics tracking disabled');
    this.clearAllData();
  }
}

