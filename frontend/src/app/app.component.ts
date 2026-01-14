import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SearchService } from './core/services/search.service';
import { FirstVisitService } from './core/services/first-visit.service';
import { AnalyticsService } from './core/services/analytics.service';
import { WelcomeModalComponent } from './shared/components/welcome-modal/welcome-modal.component';
import { WorkWithUsModalComponent } from './shared/components/work-with-us-modal/work-with-us-modal.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { AuthService } from './core/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription, filter } from 'rxjs';

interface MenuLink {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule, MatMenuModule, WelcomeModalComponent, WorkWithUsModalComponent, FooterComponent, CookieConsentComponent, AuthModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'kapi';
  searchControl = new FormControl('');
  showSearch = false; // Solo se muestra en /search
  showWelcomeModal = false;
  showWorkWithUsModal = false;
  showAuthModal = false;
  currentRoute = '/';
  isAuthenticated = false;
  currentUser: any = null;
  private subscriptions: Subscription[] = [];

  // Menú de Soporte
  supportMenu: MenuLink[] = [
    { label: 'Centro de Ayuda', route: '/help', icon: 'help' },
    { label: 'Preguntas Frecuentes', route: '/help', icon: 'quiz' },
    { label: 'Contacto', route: '/contact', icon: 'contact_mail' },
    { label: 'Reportar Problema', route: '/contact', icon: 'report_problem' }
  ];

  // Menú Legal
  legalMenu: MenuLink[] = [
    { label: 'Términos y Condiciones', route: '/legal/terms', icon: 'description' },
    { label: 'Política de Privacidad', route: '/legal/privacy', icon: 'privacy_tip' },
    { label: 'Política de Cookies', route: '/legal/cookies', icon: 'cookie' },
    { label: 'Aviso Legal', route: '/legal/notice', icon: 'gavel' }
  ];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private firstVisitService: FirstVisitService,
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    // Verificar si hay query param para abrir modal de autenticación
    const checkAuthParam = (url: string) => {
      try {
        const urlObj = new URL(url, window.location.origin);
        if (urlObj.searchParams.get('auth') === 'login') {
          this.showAuthModal = true;
        }
      } catch (e) {
        // Si no se puede parsear la URL, verificar directamente
        if (url.includes('auth=login')) {
          this.showAuthModal = true;
        }
      }
    };

    // Verificar en la ruta actual
    checkAuthParam(this.router.url);

    // Suscribirse a cambios de ruta
    const authParamSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        checkAuthParam(event.url);
      });
    
    this.subscriptions.push(authParamSub);

    // Verificar si es la primera visita y mostrar el modal
    if (this.firstVisitService.isFirstVisit()) {
      // Pequeño delay para que la página cargue primero
      setTimeout(() => {
        this.showWelcomeModal = true;
      }, 500);
    }

    // Sincronizar el término de búsqueda del servicio
    const syncSub = this.searchService.searchTerm$.subscribe(term => {
      if (this.searchControl.value !== term) {
        this.searchControl.setValue(term, { emitEvent: false });
      }
    });

    // Escuchar cambios en el input de búsqueda
    const searchSub = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.searchService.setSearchTerm(query || '');
      });

    // Mostrar/ocultar búsqueda según la ruta (solo en /search)
    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        this.showSearch = event.url.startsWith('/search') || event.urlAfterRedirects?.startsWith('/search');
      });

    this.subscriptions.push(syncSub, searchSub, routeSub);
    
    // Inicializar showSearch según la ruta actual
    this.currentRoute = this.router.url;
    this.showSearch = this.router.url.startsWith('/search');

    // Suscribirse al estado de autenticación
    const authSub = this.authService.getCurrentUser().subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });
    this.subscriptions.push(authSub);
  }

  onCloseWelcomeModal(): void {
    this.showWelcomeModal = false;
    // Solo marcar como visitado si se está mostrando por primera vez
    if (this.firstVisitService.isFirstVisit()) {
      this.firstVisitService.markAsVisited();
    }
  }

  openWelcomeModal(): void {
    this.showWelcomeModal = true;
  }

  openWorkWithUsModal(): void {
    this.showWorkWithUsModal = true;
  }

  onCloseWorkWithUsModal(): void {
    this.showWorkWithUsModal = false;
  }

  openAuthModal(): void {
    this.showAuthModal = true;
  }

  onCloseAuthModal(): void {
    this.showAuthModal = false;
  }

  onAuthSuccess(): void {
    // Usuario autenticado exitosamente
    this.showAuthModal = false;
    
    // Verificar si hay una ruta de retorno en los query params
    const url = new URL(window.location.href);
    const returnUrl = url.searchParams.get('returnUrl');
    if (returnUrl) {
      // Remover query params y redirigir
      this.router.navigateByUrl(returnUrl);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
