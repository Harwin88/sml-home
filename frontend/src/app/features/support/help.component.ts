import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FaqService, Faq, FaqCategory } from '../../core/services/faq.service';

interface HelpCategory {
  name: string;
  value: FaqCategory | 'all';
  icon: string;
  description: string;
  route?: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './help.component.html',
  styleUrls: ['./support.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class HelpComponent implements OnInit {
  expandedIndex: number | null = null;
  selectedCategory: string = 'all';
  faqs: Faq[] = [];
  loading = true;
  error: string | null = null;
  
  // Búsqueda
  searchQuery: string = '';
  isSearching = false;
  searchResults: Faq[] = [];
  private searchSubject = new Subject<string>();
  
  // Control de votos para evitar spam
  private votedFaqs: Set<string> = new Set();
  private readonly VOTED_FAQS_KEY = 'msl_faq_voted';

  constructor(
    private analytics: AnalyticsService,
    private faqService: FaqService
  ) {
    // Cargar FAQs votadas desde localStorage
    this.loadVotedFaqs();
    
    // Configurar búsqueda con debounce
    this.setupSearch();
  }

  ngOnInit(): void {
    // Track page view
    this.analytics.trackPageView('/help', 'Centro de Ayuda');
    
    // Cargar FAQs desde el backend
    this.loadFaqs();
  }

  /**
   * Configurar búsqueda con debounce
   */
  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(400), // Esperar 400ms después del último keystroke
      distinctUntilChanged(), // Solo buscar si el término cambió
      switchMap(query => {
        if (!query || query.trim().length < 3) {
          this.isSearching = false;
          this.searchResults = [];
          return [];
        }
        
        this.isSearching = true;
        return this.faqService.searchFaqs(query.trim());
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
        
        // Track búsqueda
        if (this.searchQuery.trim().length >= 3) {
          this.analytics.trackEvent('FAQ', 'Search', this.searchQuery);
        }
      },
      error: (error) => {
        console.error('Error al buscar FAQs:', error);
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  /**
   * Manejar cambio en el input de búsqueda
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearching = false;
    this.searchSubject.next('');
  }

  /**
   * Verificar si está en modo búsqueda
   */
  get isInSearchMode(): boolean {
    return this.searchQuery.trim().length >= 3;
  }

  /**
   * Cargar FAQs desde el backend
   */
  loadFaqs(): void {
    this.loading = true;
    this.error = null;

    this.faqService.getAllFaqs({
      sort: ['order:asc', 'createdAt:desc'],
      populate: ['relatedFaqs']
    }).subscribe({
      next: (faqs) => {
        this.faqs = faqs;
        this.loading = false;
        console.log(`✅ ${faqs.length} FAQs cargadas desde el backend`);
      },
      error: (error) => {
        console.error('Error al cargar FAQs:', error);
        this.error = 'Error al cargar las preguntas frecuentes. Intenta recargar la página.';
        this.loading = false;
        // Cargar FAQs de respaldo (hardcoded)
        this.loadFallbackFaqs();
      }
    });
  }

  /**
   * FAQs de respaldo si el backend no está disponible
   */
  loadFallbackFaqs(): void {
    this.faqs = this.fallbackFaqs;
  }

  categories: HelpCategory[] = [
    {
      name: 'General',
      value: 'general',
      icon: 'info',
      description: 'Información general sobre MSL Hogar'
    },
    {
      name: 'Búsqueda',
      value: 'search',
      icon: 'search',
      description: 'Cómo buscar y encontrar profesionales'
    },
    {
      name: 'Pagos',
      value: 'payments',
      icon: 'payment',
      description: 'Métodos de pago y facturación'
    },
    {
      name: 'Seguridad',
      value: 'security',
      icon: 'security',
      description: 'Verificación y confianza'
    },
    {
      name: 'Cuenta',
      value: 'account',
      icon: 'account_circle',
      description: 'Gestión de tu cuenta'
    }
  ];

  // FAQs de respaldo (fallback) si el backend no está disponible
  fallbackFaqs: Faq[] = [
    // General
    {
      category: 'general',
      icon: 'help',
      question: '¿Qué es MSL Hogar?',
      answer: 'MSL Hogar es una plataforma digital que conecta familias colombianas con profesionales verificados para servicios del hogar. Facilitamos el encuentro entre usuarios que necesitan servicios de limpieza, plomería, electricidad, jardinería y más, con proveedores calificados y de confianza.'
    },
    {
      category: 'general',
      icon: 'location_on',
      question: '¿En qué ciudades están disponibles?',
      answer: 'Actualmente operamos en las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira y Armenia. Estamos expandiéndonos continuamente a nuevas ciudades.'
    },
    {
      category: 'general',
      icon: 'schedule',
      question: '¿Cuál es el horario de atención?',
      answer: 'Nuestra plataforma está disponible 24/7 para buscar y contactar profesionales. Nuestro equipo de soporte está disponible de lunes a viernes de 8:00 AM a 6:00 PM (hora de Colombia). Para emergencias fuera de horario, contamos con un sistema de respuesta automática.'
    },
    {
      category: 'general',
      icon: 'monetization_on',
      question: '¿Cuánto cuesta usar la plataforma?',
      answer: 'Buscar y contactar profesionales es completamente gratis para los usuarios. Solo pagas directamente al profesional por el servicio contratado. No cobramos comisiones ocultas ni tarifas de intermediación.'
    },

    // Búsqueda
    {
      category: 'search',
      icon: 'search',
      question: '¿Cómo busco un profesional?',
      answer: 'Usa nuestra barra de búsqueda en la página principal. Puedes buscar por tipo de servicio (ej: "plomero", "electricista") o por descripción del problema. Luego filtra por ubicación, precio, disponibilidad y calificaciones para encontrar el profesional ideal.'
    },
    {
      category: 'search',
      icon: 'filter_alt',
      question: '¿Cómo funcionan los filtros de búsqueda?',
      answer: 'Puedes filtrar por: ubicación (ciudad o barrio), rango de precios, disponibilidad (inmediata, hoy, esta semana), calificación mínima (1-5 estrellas), tipo de servicio, experiencia del profesional y si ha sido verificado por MSL Hogar.'
    },
    {
      category: 'search',
      icon: 'star',
      question: '¿Qué significan las calificaciones?',
      answer: 'Las calificaciones (1-5 estrellas) son opiniones reales de usuarios que han contratado los servicios. Solo usuarios que han completado un servicio pueden dejar una calificación. Verificamos que todas las reseñas sean auténticas.'
    },
    {
      category: 'search',
      icon: 'verified',
      question: '¿Qué significa "Proveedor Verificado"?',
      answer: 'Los proveedores verificados han completado nuestro proceso de validación que incluye: verificación de identidad, antecedentes penales, certificaciones profesionales (cuando aplica), referencias comprobables y una entrevista con nuestro equipo.'
    },

    // Pagos
    {
      category: 'payments',
      icon: 'payment',
      question: '¿Cómo pago por los servicios?',
      answer: 'El pago se realiza directamente al profesional según el método acordado entre ambas partes. Los métodos más comunes son: efectivo al finalizar el servicio, transferencia bancaria, Nequi, Daviplata o tarjeta. Cada profesional indica sus métodos de pago aceptados en su perfil.'
    },
    {
      category: 'payments',
      icon: 'receipt',
      question: '¿Puedo solicitar factura?',
      answer: 'Sí, puedes solicitar factura directamente al profesional. Los proveedores registrados como persona jurídica o régimen común están obligados a emitir factura electrónica. Verifica en el perfil del profesional si ofrece este servicio.'
    },
    {
      category: 'payments',
      icon: 'money_off',
      question: '¿Hay costos adicionales o comisiones?',
      answer: 'No. El precio que ves en el perfil del profesional es el precio base del servicio. No cobramos comisiones adicionales. Ten en cuenta que algunos servicios pueden tener costos variables según materiales o complejidad del trabajo, lo cual debe acordarse previamente.'
    },
    {
      category: 'payments',
      icon: 'local_offer',
      question: '¿Ofrecen descuentos o promociones?',
      answer: 'Sí, frecuentemente tenemos promociones especiales, descuentos para primeros servicios y ofertas en servicios recurrentes. Suscríbete a nuestro newsletter para recibir notificaciones de promociones exclusivas.'
    },

    // Seguridad
    {
      category: 'security',
      icon: 'shield',
      question: '¿Cómo garantizan la seguridad?',
      answer: 'Implementamos múltiples medidas: verificación de antecedentes de todos los profesionales, sistema de calificaciones transparente, soporte 24/7, seguro de responsabilidad civil para incidentes, y un equipo dedicado que monitorea la calidad del servicio.'
    },
    {
      category: 'security',
      icon: 'policy',
      question: '¿Qué pasa si tengo un problema con un servicio?',
      answer: 'Contacta inmediatamente a nuestro equipo de soporte. Investigaremos el caso, mediaremos entre ambas partes y, si corresponde, tomaremos acciones como advertencias, suspensión o eliminación del profesional de la plataforma. Tu satisfacción y seguridad son nuestra prioridad.'
    },
    {
      category: 'security',
      icon: 'privacy_tip',
      question: '¿Cómo protegen mis datos personales?',
      answer: 'Cumplimos estrictamente con la Ley 1581 de 2012 de Protección de Datos de Colombia. Tu información personal está encriptada, solo se comparte lo mínimo necesario para contactar profesionales, y nunca vendemos tus datos a terceros. Lee nuestra Política de Privacidad para más detalles.'
    },
    {
      category: 'security',
      icon: 'gpp_good',
      question: '¿Qué es el Seguro de Garantía?',
      answer: 'Es una cobertura opcional que algunos profesionales ofrecen para proteger contra daños materiales durante el servicio. Verifica en el perfil del profesional si cuenta con este seguro y qué cubre específicamente.'
    },

    // Cuenta
    {
      category: 'account',
      icon: 'person_add',
      question: '¿Necesito crear una cuenta para usar MSL Hogar?',
      answer: 'No es obligatorio para buscar profesionales, pero crear una cuenta te permite: guardar tus búsquedas favoritas, contactar directamente a profesionales, ver tu historial de servicios, recibir notificaciones personalizadas y dejar calificaciones.'
    },
    {
      category: 'account',
      icon: 'edit',
      question: '¿Cómo edito mi perfil?',
      answer: 'Inicia sesión, ve a "Mi Cuenta" en el menú superior, y selecciona "Editar Perfil". Puedes actualizar tu información personal, preferencias de contacto, dirección y métodos de pago preferidos.'
    },
    {
      category: 'account',
      icon: 'delete',
      question: '¿Puedo eliminar mi cuenta?',
      answer: 'Sí, puedes solicitar la eliminación de tu cuenta en cualquier momento. Ve a Configuración > Privacidad > Eliminar Cuenta. Ten en cuenta que esto eliminará permanentemente tu historial, calificaciones y datos personales según nuestra política de retención de datos.'
    },
    {
      category: 'account',
      icon: 'work',
      question: '¿Cómo puedo trabajar como profesional en MSL Hogar?',
      answer: 'Si eres un profesional de servicios del hogar, haz clic en "Trabaja con Nosotros" en el menú principal. Completa el formulario de registro, proporciona tu documentación y certificaciones, y nuestro equipo revisará tu solicitud en 2-3 días hábiles.'
    }
  ];

  get filteredFaqs(): Faq[] {
    // Si está buscando, mostrar resultados de búsqueda
    if (this.isInSearchMode) {
      return this.searchResults;
    }
    
    // Si no, filtrar por categoría
    if (this.selectedCategory === 'all') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  toggleFaq(index: number, faq: Faq): void {
    const wasExpanded = this.expandedIndex === index;
    this.expandedIndex = this.expandedIndex === index ? null : index;
    
    // Si se expandió (no se colapsó), incrementar vistas
    // Priorizar documentId sobre id para Strapi 5
    const faqId = faq.documentId || faq.id;
    if (!wasExpanded && faqId) {
      this.faqService.incrementView(faqId).subscribe({
        next: (result) => {
          if (faq.viewCount !== undefined) {
            faq.viewCount = result.viewCount;
          }
        },
        error: (error) => console.error('Error al incrementar vistas:', error)
      });
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.expandedIndex = null;
    
    // Limpiar búsqueda al cambiar categoría
    this.clearSearch();
    
    // Si selecciona una categoría específica, cargar FAQs de esa categoría
    if (category !== 'all') {
      this.loading = true;
      this.faqService.getFaqsByCategory(category as FaqCategory).subscribe({
        next: (faqs) => {
          this.faqs = faqs;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar FAQs por categoría:', error);
          this.loading = false;
        }
      });
    } else {
      // Recargar todas las FAQs
      this.loadFaqs();
    }
  }

  /**
   * Verificar si el usuario ya votó por esta FAQ
   */
  hasVoted(faq: Faq): boolean {
    const faqId = faq.documentId || faq.id?.toString();
    return faqId ? this.votedFaqs.has(faqId) : false;
  }

  /**
   * Cargar FAQs votadas desde localStorage
   */
  private loadVotedFaqs(): void {
    try {
      const stored = localStorage.getItem(this.VOTED_FAQS_KEY);
      if (stored) {
        const votedArray = JSON.parse(stored);
        this.votedFaqs = new Set(votedArray);
      }
    } catch (error) {
      console.error('Error al cargar votos desde localStorage:', error);
      this.votedFaqs = new Set();
    }
  }

  /**
   * Guardar FAQs votadas en localStorage
   */
  private saveVotedFaqs(): void {
    try {
      const votedArray = Array.from(this.votedFaqs);
      localStorage.setItem(this.VOTED_FAQS_KEY, JSON.stringify(votedArray));
    } catch (error) {
      console.error('Error al guardar votos en localStorage:', error);
    }
  }

  /**
   * Marcar que el usuario votó por esta FAQ
   */
  private markAsVoted(faqId: string): void {
    this.votedFaqs.add(faqId);
    this.saveVotedFaqs();
  }

  /**
   * Marcar FAQ como útil
   */
  markAsHelpful(faq: Faq, helpful: boolean, event: Event): void {
    event.stopPropagation(); // Evitar que se expanda/colapse el accordion
    
    // Priorizar documentId sobre id para Strapi 5
    const faqId = faq.documentId || faq.id?.toString();
    if (!faqId) return;

    // Verificar si ya votó
    if (this.hasVoted(faq)) {
      console.log('Ya has votado por esta FAQ');
      return;
    }

    this.faqService.markHelpful(faqId, helpful).subscribe({
      next: (result) => {
        faq.helpfulCount = result.helpfulCount;
        faq.notHelpfulCount = result.notHelpfulCount;
        
        // Marcar como votado
        this.markAsVoted(faqId);
        
        // Track evento
        this.analytics.trackEvent('FAQ', helpful ? 'Helpful' : 'Not Helpful', faq.question);
      },
      error: (error) => console.error('Error al marcar FAQ:', error)
    });
  }
}

