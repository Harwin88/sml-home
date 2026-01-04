import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { SearchService } from './core/services/search.service';
import { FirstVisitService } from './core/services/first-visit.service';
import { WelcomeModalComponent } from './shared/components/welcome-modal/welcome-modal.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, WelcomeModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'MSL Hogar';
  searchControl = new FormControl('');
  showSearch = true;
  showWelcomeModal = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private firstVisitService: FirstVisitService
  ) {}

  ngOnInit(): void {
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

    // Mostrar/ocultar búsqueda según la ruta
    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showSearch = event.url === '/' || event.urlAfterRedirects === '/';
      });

    this.subscriptions.push(syncSub, searchSub, routeSub);
    
    // Inicializar showSearch según la ruta actual
    this.showSearch = this.router.url === '/';
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
