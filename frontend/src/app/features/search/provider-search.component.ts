import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryService } from '../../core/services/category.service';
import { ServiceProviderService } from '../../core/services/service-provider.service';
import { SearchService } from '../../core/services/search.service';
import { ReviewService } from '../../core/services/review.service';
import { GeolocationService, GeolocationPosition } from '../../core/services/geolocation.service';
import { RatingModalComponent } from '../../shared/components/rating-modal/rating-modal.component';
import { CategoryView } from '../../core/models/category.model';
import { ServiceProviderCard } from '../../core/models/service-provider.model';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Subscription } from 'rxjs';

interface CategoryFilter {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    icon?: string;
    parentName?: string;
    selected: boolean;
}

@Component({
    selector: 'app-provider-search',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatIconModule, RatingModalComponent],
    templateUrl: './provider-search.component.html',
    styleUrls: ['./provider-search.component.scss']
})
export class ProviderSearchComponent implements OnInit, OnDestroy {

    // Búsqueda
    searchControl = new FormControl(''); // Para buscar proveedores (mantener para compatibilidad interna)
    categorySearchControl = new FormControl(''); // Para filtrar la lista de categorías

    // Categorías y filtros
    mainCategories: CategoryView[] = [];
    subcategoryFilters: CategoryFilter[] = [];
    filteredSubcategoryFilters: CategoryFilter[] = []; // Categorías filtradas para mostrar
    selectedSubcategory: string | null = null; // Solo una categoría seleccionada a la vez

    // Resultados
    providers: ServiceProviderCard[] = [];
    providersFull: any[] = []; // Guardar proveedores completos para búsqueda
    filteredProviders: ServiceProviderCard[] = [];

    // Estado
    loading = false;
    loadingCategories = false;
    error = '';

    // Paginación
    currentPage = 1;
    pageSize = 12;
    totalProviders = 0;

    // Filtros adicionales
    minRating = 0;
    showOnlyVerified = false;
    selectedPriceRange: string = '';
    priceRanges = ['economico', 'moderado', 'premium'];

    // Modal de calificación
    showRatingModal = false;
    selectedProviderForRating: ServiceProviderCard | null = null;

    // Geolocalización
    userLocation: GeolocationPosition | null = null;
    isGettingLocation = false;
    locationError: string | null = null;
    geolocationSupported = false;
    showManualLocation = false;
    manualAddress = '';
    isGeocoding = false;

    private searchSubscription?: Subscription;
    private locationSubscription?: Subscription;

    constructor(
        private categoryService: CategoryService,
        private providerService: ServiceProviderService,
        private searchService: SearchService,
        private reviewService: ReviewService,
        private geolocationService: GeolocationService,
        private configService: ConfigService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private favoritesService: FavoritesService
    ) { }

    ngOnInit(): void {
        console.log('ProviderSearchComponent: Inicializando...');
        this.loadCategories();
        this.loadAllProviders();
        this.setupSearch();
        this.setupCategorySearch();
        
        // Sincronizar con el servicio de búsqueda compartido
        this.syncWithSearchService();

        // Configurar geolocalización
        this.setupGeolocation();

        // Cargar favoritos si el usuario está autenticado
        if (this.isAuthenticated()) {
            this.loadUserFavorites();
        }
    }

    ngOnDestroy(): void {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
        }
    }

    /**
     * Sincronizar con el servicio de búsqueda compartido del header
     */
    private syncWithSearchService(): void {
        // Inicializar con el valor actual del servicio
        const currentTerm = this.searchService.getSearchTerm();
        if (currentTerm) {
            this.searchControl.setValue(currentTerm);
        }

        // Suscribirse a cambios en el servicio de búsqueda
        this.searchSubscription = this.searchService.searchTerm$.subscribe(term => {
            if (this.searchControl.value !== term) {
                this.searchControl.setValue(term);
            }
        });
    }

    /**
     * Cargar categorías nodo hoja (sin hijos) como filtros
     */
    loadCategories(): void {
        this.loadingCategories = true;
        console.log('ProviderSearchComponent: Cargando categorías...');

        // Obtener el árbol completo para mostrar la estructura
        this.categoryService.getCategoryTree().subscribe({
            next: (categories) => {
                console.log('ProviderSearchComponent: Categorías cargadas:', categories);
                this.mainCategories = categories;
                // Cargar solo nodos hoja para los filtros
                this.loadLeafCategories();
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.error = 'Error al cargar categorías. Verifica la configuración de la API.';
                this.loadingCategories = false;
            }
        });
    }

    /**
     * Cargar solo categorías nodo hoja (sin hijos) para filtros
     */
    loadLeafCategories(): void {
        this.categoryService.getLeafCategories().subscribe({
            next: (leafCategories) => {
                this.buildLeafCategoryFilters(leafCategories);
                this.loadingCategories = false;
            },
            error: (err) => {
                console.error('Error loading leaf categories:', err);
                this.loadingCategories = false;
            }
        });
    }

    /**
     * Construir lista de categorías nodo hoja para filtros
     */
    buildLeafCategoryFilters(leafCategories: CategoryView[]): void {
        this.subcategoryFilters = [];

        // Para cada categoría hoja, encontrar su categoría padre
        leafCategories.forEach(leafCat => {
            const parentCategory = this.findParentCategory(leafCat, this.mainCategories);
            
            this.subcategoryFilters.push({
                id: leafCat.id,
                documentId: leafCat.documentId,
                name: leafCat.name,
                slug: leafCat.slug,
                icon: leafCat.icon,
                parentName: parentCategory?.name || 'General',
                selected: false
            });
        });

        // Inicializar la lista filtrada con todas las categorías
        this.filteredSubcategoryFilters = [...this.subcategoryFilters];

        // Verificar si hay un queryParam de categoría y seleccionarla
        this.checkCategoryQueryParam();
    }

    /**
     * Verificar queryParams y seleccionar categoría si existe
     */
    private checkCategoryQueryParam(): void {
        // Leer el queryParam una vez (no suscribirse para evitar múltiples llamadas)
        const categorySlug = this.route.snapshot.queryParams['category'];
        if (categorySlug) {
            // Buscar la categoría por slug
            const category = this.subcategoryFilters.find(cat => cat.slug === categorySlug);
            if (category) {
                // Seleccionar la categoría automáticamente
                this.selectedSubcategory = categorySlug;
                category.selected = true;
                // Cargar proveedores con el filtro aplicado
                this.loadProvidersWithFilters();
            }
        }
    }

    /**
     * Helper: Encontrar la categoría padre de una categoría hoja
     */
    private findParentCategory(category: CategoryView, tree: CategoryView[]): CategoryView | null {
        for (const mainCat of tree) {
            if (this.isDescendantOf(category, mainCat)) {
                return mainCat;
            }
        }
        return null;
    }

    /**
     * Helper: Verificar si una categoría es descendiente de otra
     */
    private isDescendantOf(category: CategoryView, parent: CategoryView): boolean {
        if (!parent.subcategories || parent.subcategories.length === 0) {
            return false;
        }
        
        // Verificar si está directamente en los hijos
        if (parent.subcategories.some(sub => sub.documentId === category.documentId)) {
            return true;
        }
        
        // Buscar recursivamente en los hijos
        return parent.subcategories.some(sub => this.isDescendantOf(category, sub));
    }

    /**
     * Cargar todos los proveedores activos
     * Solo se usa cuando NO hay ningún filtro activo
     */
    loadAllProviders(): void {
        this.loading = true;
        this.error = '';
        console.log('ProviderSearchComponent: Cargando proveedores...');

        this.providerService.getAll({
            filters: {
                isActive: { $eq: true }
            },
            populate: '*', // Usar populate=* para obtener todo (photo, categories, portfolio)
            pagination: {
                page: this.currentPage,
                pageSize: this.pageSize
            }
        }).subscribe({
            next: (response) => {
                console.log('ProviderSearchComponent: Proveedores cargados:', response);
                this.providersFull = response.data; // Guardar objetos completos
                this.providers = response.data.map(p => this.toCard(p));
                this.filteredProviders = [...this.providers];
                this.totalProviders = response.meta.pagination.total;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading providers:', err);
                this.error = 'Error al cargar proveedores. Verifica la configuración de la API.';
                this.loading = false;
            }
        });
    }

    /**
     * Configurar búsqueda en tiempo real de proveedores
     */
    setupSearch(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(query => {
                // Si se borra el texto (query vacío o null), recargar todos los proveedores
                if (!query || query.trim() === '') {
                    // Si hay otros filtros activos, aplicar filtros sin búsqueda
                    // Si no hay filtros, recargar todos los proveedores
                    if (this.selectedSubcategory || 
                        this.minRating > 0 || 
                        this.showOnlyVerified || 
                        this.selectedPriceRange) {
                        this.applyFilters();
                    } else {
                        // No hay filtros ni búsqueda, recargar todos
                        this.loadAllProviders();
                    }
                } else {
                    // Hay texto de búsqueda, aplicar filtros (que incluirá la búsqueda)
                    this.applyFilters();
                }
            });
    }

    /**
     * Configurar búsqueda de categorías (para filtrar la lista de categorías)
     */
    setupCategorySearch(): void {
        this.categorySearchControl.valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {
                this.filterCategories(searchTerm || '');
            });
    }

    /**
     * Filtrar la lista de categorías basado en el término de búsqueda
     */
    filterCategories(searchTerm: string): void {
        const term = searchTerm.toLowerCase().trim();

        if (!term) {
            // Si no hay búsqueda, mostrar todas las categorías
            this.filteredSubcategoryFilters = [...this.subcategoryFilters];
            return;
        }

        // Filtrar categorías que coincidan con el término de búsqueda
        this.filteredSubcategoryFilters = this.subcategoryFilters.filter(category => {
            // Buscar en el nombre de la categoría
            const nameMatch = category.name.toLowerCase().includes(term);
            
            // Buscar en el nombre del padre
            const parentMatch = category.parentName?.toLowerCase().includes(term) || false;
            
            // Buscar en el slug
            const slugMatch = category.slug.toLowerCase().includes(term);

            return nameMatch || parentMatch || slugMatch;
        });
    }

    /**
     * Normaliza un texto removiendo tildes y caracteres especiales
     * (debe coincidir con la función del backend)
     */
    private normalizeText(text: string): string {
        if (!text) return '';
        
        return text
            .normalize('NFD') // Descompone los caracteres con acentos
            .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (tildes)
            .toLowerCase() // Convierte a minúsculas
            .trim(); // Elimina espacios al inicio y final
    }

    /**
     * Buscar proveedores en la caché (proveedores ya cargados)
     * No hace petición al API, solo filtra localmente
     * Usa campos normalizados para búsqueda sin tildes
     */
    searchInCache(query: string): void {
        // Normalizar el término de búsqueda
        const normalizedSearchTerm = this.normalizeText(query);
        const searchTerm = query.toLowerCase().trim();
        
        // Usar los proveedores completos para búsqueda más exhaustiva
        let sourceProviders = this.providersFull.length > 0 
            ? this.providersFull 
            : this.providers;

        // Filtrar por término de búsqueda en los objetos completos
        let filteredFull = sourceProviders.filter((provider: any) => {
            // Buscar en el nombre normalizado (usar campo normalizado si existe, sino normalizar on-the-fly)
            const nameNormalized = provider.name_normalized || this.normalizeText(provider.name || '');
            const nameMatch = nameNormalized.includes(normalizedSearchTerm);
            
            // Buscar en descripción normalizada (usar campo normalizado si existe, sino normalizar on-the-fly)
            const descriptionNormalized = provider.description_normalized || this.normalizeText(provider.description || '');
            const descriptionMatch = descriptionNormalized.includes(normalizedSearchTerm);
            
            // Buscar en área de servicio (sin normalizar por si acaso)
            const serviceAreaMatch = provider.serviceArea?.toLowerCase().includes(searchTerm) || false;
            
            // Buscar en categorías (puede venir como array de objetos o strings)
            let categoriesMatch = false;
            if (provider.categories) {
                if (Array.isArray(provider.categories)) {
                    categoriesMatch = provider.categories.some((cat: any) => {
                        const catName = typeof cat === 'string' ? cat : cat.name;
                        return catName?.toLowerCase().includes(searchTerm) || false;
                    });
                }
            }
            
            // Buscar en teléfono
            const phoneMatch = provider.phone?.toLowerCase().includes(searchTerm) || false;
            
            return nameMatch || descriptionMatch || serviceAreaMatch || categoriesMatch || phoneMatch;
        });

        // Convertir a cards y aplicar otros filtros
        let filtered = filteredFull.map((p: any) => {
            const card = this.providers.find(card => card.documentId === p.documentId);
            return card || this.toCard(p);
        }).filter(card => card !== undefined) as ServiceProviderCard[];

        // Aplicar otros filtros además de la búsqueda
        if (this.minRating > 0) {
            filtered = filtered.filter(p => p.rating >= this.minRating);
        }

        if (this.showOnlyVerified) {
            filtered = filtered.filter(p => p.isVerified);
        }

        if (this.selectedPriceRange) {
            filtered = filtered.filter(p => p.priceRange === this.selectedPriceRange);
        }

        this.filteredProviders = filtered;
    }

    /**
     * Buscar proveedores por texto en el API (método antiguo, mantener por compatibilidad)
     * @deprecated Usar searchInCache en su lugar para buscar en la caché local
     */
    searchProviders(query: string): void {
        this.loading = true;

        this.providerService.search(query, this.currentPage, this.pageSize).subscribe({
            next: (providers) => {
                this.providers = providers;
                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Error en la búsqueda';
                console.error(err);
                this.loading = false;
            }
        });
    }

    /**
     * Seleccionar/deseleccionar subcategoría (solo una a la vez)
     */
    toggleSubcategory(subcategory: CategoryFilter): void {
        // Si la categoría ya está seleccionada, deseleccionarla
        if (this.selectedSubcategory === subcategory.slug) {
            this.selectedSubcategory = null;
            subcategory.selected = false;
        } else {
            // Deseleccionar todas las demás categorías
            this.subcategoryFilters.forEach(f => f.selected = false);
            
            // Seleccionar la nueva categoría
            this.selectedSubcategory = subcategory.slug;
            subcategory.selected = true;
        }

        // Recargar proveedores con los filtros aplicados
        this.loadProvidersWithFilters();
    }


    /**
     * Limpiar todos los filtros
     */
    clearFilters(): void {
        this.subcategoryFilters.forEach(f => f.selected = false);
        this.selectedSubcategory = null;
        this.minRating = 0;
        this.showOnlyVerified = false;
        this.selectedPriceRange = '';
        this.searchControl.setValue('');
        // Recargar todos los proveedores sin filtros
        this.loadAllProviders();
    }

    /**
     * Cargar proveedores con filtros aplicados (hacer petición al API)
     */
    loadProvidersWithFilters(): void {
        this.loading = true;
        this.error = '';
        this.currentPage = 1; // Resetear a primera página

        // Construir filtros para la API
        const filters: any = {
            isActive: { $eq: true }
        };

        // Filtro por categoría (solo una puede estar seleccionada)
        if (this.selectedSubcategory) {
            filters.categories = {
                slug: { $eq: this.selectedSubcategory }
            };
        }

        // Filtro por nombre (búsqueda del header) - usar $containsi (case-insensitive)
        const searchQuery = this.searchControl.value?.trim();
        if (searchQuery) {
            filters.name = { $containsi: searchQuery };
        }

        // Filtro por rating mínimo
        if (this.minRating > 0) {
            filters.rating = { $gte: this.minRating };
        }

        // Filtro por verificados
        if (this.showOnlyVerified) {
            filters.isVerified = { $eq: true };
        }

        // Filtro por rango de precio
        if (this.selectedPriceRange) {
            filters.priceRange = { $eq: this.selectedPriceRange };
        }

        // Hacer petición al API con los filtros
        this.providerService.getAll({
            filters,
            populate: '*', // Usar populate=* para obtener todo
            sort: ['rating:desc'],
            pagination: {
                page: this.currentPage,
                pageSize: this.pageSize
            }
        }).subscribe({
            next: (response) => {
                console.log('ProviderSearchComponent: Proveedores filtrados cargados:', response);
                this.providersFull = response.data; // Guardar objetos completos
                this.providers = response.data.map(p => this.toCard(p));
                this.filteredProviders = [...this.providers]; // Mostrar todos ya que vienen filtrados del servidor
                this.totalProviders = response.meta.pagination.total;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading filtered providers:', err);
                this.error = 'Error al cargar proveedores filtrados.';
                this.loading = false;
            }
        });
    }

    /**
     * Aplicar filtros - siempre hacer petición al API para obtener resultados filtrados del servidor
     * Los filtros funcionan de forma independiente y pueden combinarse
     */
    applyFilters(): void {
        // Verificar si hay algún filtro activo o término de búsqueda
        const searchQuery = this.searchControl.value?.trim();
        const hasFilters = this.selectedSubcategory || 
                          this.minRating > 0 || 
                          this.showOnlyVerified || 
                          this.selectedPriceRange ||
                          (searchQuery && searchQuery.length > 0);

        if (hasFilters) {
            // Si hay filtros o búsqueda, hacer petición al API
            this.loadProvidersWithFilters();
        } else {
            // Si no hay filtros ni búsqueda, cargar todos los proveedores
            if (this.providers.length === 0) {
                // Solo cargar si no hay proveedores en caché
                this.loadAllProviders();
            } else {
                // Si ya hay proveedores cargados, mostrarlos todos
                this.filteredProviders = [...this.providers];
            }
        }
    }


    /**
     * Contar filtros activos
     */
    get activeFiltersCount(): number {
        let count = 0;
        if (this.selectedSubcategory) count++;
        if (this.minRating > 0) count++;
        if (this.showOnlyVerified) count++;
        if (this.selectedPriceRange) count++;
        const searchQuery = this.searchControl.value?.trim();
        if (searchQuery) count++;
        return count;
    }

    /**
     * Helper: Convertir a ServiceProviderCard
     */
    private toCard(provider: any): ServiceProviderCard {
        // Con populate=*, photo viene directamente como objeto (no dentro de data)
        const photo = provider.photo;
        const categories = provider.categories || [];
        
        // Construir URL de la foto
        let photoUrl: string | undefined = undefined;
        if (photo?.url) {
            const url = photo.url;
            // Si ya es una URL completa, usarla directamente
            if (url.startsWith('http://') || url.startsWith('https://')) {
                photoUrl = url;
            } else {
                // Construir URL completa: apiUrl + url
                photoUrl = `${this.configService.apiUrl}${url}`;
            }
        }
        
        return {
            id: provider.id,
            documentId: provider.documentId,
            name: provider.name,
            phone: provider.phone,
            rating: provider.rating,
            totalReviews: provider.totalReviews,
            experienceYears: provider.experienceYears,
            priceRange: provider.priceRange,
            hourlyRate: provider.hourlyRate,
            isVerified: provider.isVerified,
            photoUrl: photoUrl,
            categories: Array.isArray(categories) 
                ? categories.map((c: any) => c.name || c)
                : []
        };
    }

    /**
     * Navegar a página
     */
    goToPage(page: number): void {
        this.currentPage = page;
        const query = this.searchControl.value;
        if (query && query.trim()) {
            this.searchProviders(query.trim());
        } else {
            this.loadAllProviders();
        }
    }

    /**
     * Total de páginas
     */
    get totalPages(): number {
        return Math.ceil(this.totalProviders / this.pageSize);
    }


    /**
     * Helper: Verificar si una categoría está seleccionada
     */
    isCategoryHighlighted(categoryName: string): boolean {
        const filter = this.subcategoryFilters.find(f => f.name === categoryName);
        return filter ? this.selectedSubcategory === filter.slug : false;
    }

    /**
     * Manejar error al cargar imagen - evita loops infinitos
     */
    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        const defaultAvatar = 'assets/default-avatar.png';
        
        // Solo cambiar si no es ya el default-avatar para evitar loops
        if (img.src && !img.src.includes(defaultAvatar)) {
            img.src = defaultAvatar;
            // Deshabilitar el handler de error después del primer fallo para evitar loops
            img.onerror = null;
        } else {
            // Si ya es el default-avatar y falla, usar un data URI transparente para evitar parpadeo
            img.onerror = null;
            img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1\' height=\'1\'%3E%3C/svg%3E';
        }
    }

    /**
     * Abrir modal de calificación
     */
    openRatingModal(provider: ServiceProviderCard): void {
        this.selectedProviderForRating = provider;
        this.showRatingModal = true;
    }

    /**
     * Cerrar modal de calificación
     */
    closeRatingModal(): void {
        this.showRatingModal = false;
        this.selectedProviderForRating = null;
    }

    /**
     * Enviar calificación
     */
    onSubmitRating(reviewData: any): void {
        if (!this.selectedProviderForRating) return;

        this.reviewService.submitReview(reviewData).subscribe({
            next: () => {
                // Éxito - podríamos mostrar un mensaje o recargar los datos
                alert('¡Gracias por tu calificación!');
                this.closeRatingModal();
                // Opcional: Recargar proveedores para actualizar ratings
                // this.loadAllProviders();
            },
            error: (err) => {
                console.error('Error al enviar calificación:', err);
                alert('Hubo un error al enviar tu calificación. Por favor intenta de nuevo.');
            }
        });
    }

    /**
     * Configurar geolocalización
     */
    private setupGeolocation(): void {
        this.geolocationSupported = this.geolocationService.isSupported();
        
        // Suscribirse a cambios en la ubicación actual
        this.locationSubscription = this.geolocationService.getCurrentPositionObservable().subscribe(
            position => {
                this.userLocation = position;
            }
        );

        // Suscribirse al estado de obtención de ubicación
        this.geolocationService.getIsGettingLocationObservable().subscribe(
            isGetting => {
                this.isGettingLocation = isGetting;
            }
        );

        // Cargar ubicación guardada si existe
        const savedLocation = this.geolocationService.getCurrentPositionSync();
        if (savedLocation) {
            this.userLocation = savedLocation;
        }
    }

    /**
     * Limpiar ubicación
     */
    clearLocation(): void {
        this.geolocationService.clearLocation();
        this.userLocation = null;
        this.locationError = null;
        this.showManualLocation = false;
        this.manualAddress = '';
    }

    /**
     * Obtener ubicación del usuario (con fallback automático)
     */
    getUserLocation(): void {
        this.locationError = null;
        this.isGettingLocation = true;
        this.showManualLocation = false;

        this.geolocationService.getCurrentPosition().subscribe({
            next: (position) => {
                this.userLocation = position;
                this.locationError = null;
                console.log('Ubicación obtenida:', position);
                
                // Si es por IP, obtener nombre de la ubicación
                if (position.source === 'ip' && !position.address) {
                    this.geolocationService.reverseGeocode(position.latitude, position.longitude).subscribe({
                        next: (address) => {
                            if (this.userLocation) {
                                this.userLocation.address = address;
                            }
                        }
                    });
                }
            },
            error: (error) => {
                this.locationError = error.message || 'Error al obtener la ubicación';
                this.userLocation = null;
                // Si falla todo, mostrar opción manual
                if (error.code === -2 || error.code === -3) {
                    this.showManualLocation = true;
                }
                console.error('Error de geolocalización:', error);
            }
        });
    }

    /**
     * Buscar ubicación por dirección manual
     */
    searchManualLocation(): void {
        if (!this.manualAddress.trim()) {
            this.locationError = 'Por favor, ingresa una dirección';
            return;
        }

        this.isGeocoding = true;
        this.locationError = null;

        this.geolocationService.geocodeAddress(this.manualAddress).subscribe({
            next: (position) => {
                this.userLocation = position;
                this.locationError = null;
                this.showManualLocation = false;
                this.manualAddress = '';
                this.isGeocoding = false;
            },
            error: (error) => {
                this.locationError = error.message || 'No se pudo encontrar la dirección';
                this.isGeocoding = false;
            }
        });
    }

    /**
     * Mostrar/ocultar opción de ubicación manual
     */
    toggleManualLocation(): void {
        this.showManualLocation = !this.showManualLocation;
        this.manualAddress = '';
        this.locationError = null;
    }


    /**
     * Formatear precio en formato colombiano
     */
    formatPrice(price: number): string {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    /**
     * Generar URL de WhatsApp con el ID y nombre del proveedor
     */
    getWhatsAppUrl(provider: ServiceProviderCard): string {
        // Limpiar el número de teléfono (remover espacios, guiones, paréntesis)
        const cleanPhone = provider.phone.replace(/[\s\-\(\)]/g, '');
        
        // Crear el mensaje con el nombre e ID del proveedor
        const message = `Hola ${provider.name}, estoy interesado en tu servicio. ID: ${provider.documentId}`;
        
        // Codificar el mensaje para la URL
        const encodedMessage = encodeURIComponent(message);
        
        // Generar la URL de WhatsApp
        // Formato: https://wa.me/[número]?text=[mensaje]
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    /**
     * Cargar favoritos del usuario autenticado
     */
    loadUserFavorites(): void {
        const user = this.authService.getCurrentUserSync();
        if (!user || !(user as any).documentId) {
            console.log('ProviderSearchComponent: No hay documentId, intentando refrescar usuario...');
            this.authService.refreshUser().subscribe({
                next: (updatedUser) => {
                    if ((updatedUser as any)?.documentId) {
                        this.loadFavoritesByDocumentId((updatedUser as any).documentId);
                    }
                },
                error: (error) => {
                    console.error('ProviderSearchComponent: Error al refrescar usuario:', error);
                }
            });
            return;
        }

        this.loadFavoritesByDocumentId((user as any).documentId);
    }

    /**
     * Cargar favoritos usando documentId
     */
    private loadFavoritesByDocumentId(documentId: string): void {
        this.favoritesService.getFavoritesByDocumentId(documentId).subscribe({
            next: (favorites) => {
                console.log('ProviderSearchComponent: Favoritos cargados:', favorites?.length || 0);
                // El servicio de favoritos ya actualiza su cache interno
                // Solo necesitamos asegurarnos de que el usuario tenga los favoritos actualizados
                this.authService.refreshUser().subscribe();
            },
            error: (error) => {
                console.error('ProviderSearchComponent: Error al cargar favoritos:', error);
            }
        });
    }

    /**
     * Verificar si un proveedor está en favoritos
     */
    isFavorite(provider: ServiceProviderCard): boolean {
        if (!this.isAuthenticated()) {
            return false;
        }
        return this.favoritesService.isFavorite(provider.id);
    }

    /**
     * Toggle favorito (agregar o remover)
     */
    toggleFavorite(provider: ServiceProviderCard): void {
        if (!this.isAuthenticated()) {
            // Si no está autenticado, abrir modal de login
            // Por ahora solo mostramos un mensaje
            alert('Debes iniciar sesión para agregar favoritos');
            return;
        }

        if (this.isFavorite(provider)) {
            // Remover de favoritos
            this.favoritesService.removeFavorite(provider.id).subscribe({
                next: () => {
                    // Actualizar estado local si es necesario
                    this.authService.refreshUser().subscribe();
                },
                error: (error) => {
                    console.error('Error al remover favorito:', error);
                    alert('Error al remover de favoritos');
                }
            });
        } else {
            // Agregar a favoritos
            this.favoritesService.addFavorite(provider.id).subscribe({
                next: () => {
                    // Actualizar estado local si es necesario
                    this.authService.refreshUser().subscribe();
                },
                error: (error) => {
                    console.error('Error al agregar favorito:', error);
                    alert('Error al agregar a favoritos');
                }
            });
        }
    }
}
