import { Injectable } from '@angular/core';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

export interface CookieConsent {
  necessary: boolean;      // Siempre true, no se puede desactivar
  analytics: boolean;      // Google Analytics, tracking
  marketing: boolean;      // Publicidad, remarketing
  preferences: boolean;    // Preferencias del usuario
  timestamp: number;       // Cuándo dio el consentimiento
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly CONSENT_COOKIE_NAME = 'kapi_cookie_consent';
  private readonly CONSENT_EXPIRY_DAYS = 365;

  constructor() {}

  /**
   * Establecer una cookie
   */
  set(name: string, value: string, options?: CookieOptions): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options) {
      if (options.expires) {
        const expires = options.expires instanceof Date 
          ? options.expires 
          : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${expires.toUTCString()}`;
      }

      if (options.path) {
        cookieString += `; path=${options.path}`;
      } else {
        cookieString += `; path=/`; // Default path
      }

      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      if (options.secure) {
        cookieString += `; secure`;
      }

      if (options.sameSite) {
        cookieString += `; SameSite=${options.sameSite}`;
      }
    } else {
      cookieString += `; path=/`;
    }

    document.cookie = cookieString;
  }

  /**
   * Obtener una cookie por nombre
   */
  get(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Eliminar una cookie
   */
  delete(name: string, path: string = '/', domain?: string): void {
    this.set(name, '', {
      expires: new Date(0),
      path,
      domain
    });
  }

  /**
   * Verificar si existe una cookie
   */
  exists(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Obtener todas las cookies
   */
  getAll(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const cookieStrings = document.cookie.split(';');

    for (let cookie of cookieStrings) {
      cookie = cookie.trim();
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  /**
   * Eliminar todas las cookies
   */
  deleteAll(path: string = '/', domain?: string): void {
    const cookies = this.getAll();
    for (const name in cookies) {
      this.delete(name, path, domain);
    }
  }

  /**
   * Guardar consentimiento de cookies
   */
  saveConsent(consent: CookieConsent): void {
    const consentData = {
      ...consent,
      timestamp: Date.now()
    };

    this.set(this.CONSENT_COOKIE_NAME, JSON.stringify(consentData), {
      expires: this.CONSENT_EXPIRY_DAYS,
      path: '/',
      sameSite: 'Lax'
    });
  }

  /**
   * Obtener consentimiento de cookies
   */
  getConsent(): CookieConsent | null {
    const consentString = this.get(this.CONSENT_COOKIE_NAME);
    
    if (!consentString) {
      return null;
    }

    try {
      return JSON.parse(consentString) as CookieConsent;
    } catch (error) {
      console.error('Error parsing cookie consent:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario ha dado consentimiento
   */
  hasConsent(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Verificar si un tipo específico de cookie está permitido
   */
  isAllowed(type: keyof Omit<CookieConsent, 'timestamp'>): boolean {
    const consent = this.getConsent();
    
    if (!consent) {
      return false;
    }

    return consent[type] === true;
  }

  /**
   * Eliminar consentimiento de cookies
   */
  deleteConsent(): void {
    this.delete(this.CONSENT_COOKIE_NAME);
  }

  /**
   * Obtener el consentimiento por defecto (solo necesarias)
   */
  getDefaultConsent(): CookieConsent {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now()
    };
  }

  /**
   * Obtener el consentimiento completo (todas aceptadas)
   */
  getFullConsent(): CookieConsent {
    return {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now()
    };
  }
}

