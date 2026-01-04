import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryService } from '../../core/services/category.service';
import { ServiceProviderService } from '../../core/services/service-provider.service';
import { CategoryView } from '../../core/models/category.model';
import { ServiceProviderCard } from '../../core/models/service-provider.model';
import { API_CONFIG } from '../../core/config/api.config';

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
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './provider-search.component.html',
    styleUrls: ['./provider-search.component.scss']
})
export class ProviderSearchComponent implements OnInit {

    // Búsqueda
    searchControl = new FormControl(''); // Para buscar proveedores
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

    constructor(
        private categoryService: CategoryService,
        private providerService: ServiceProviderService
    ) { }

    ngOnInit(): void {
        console.log('ProviderSearchComponent: Inicializando...');
        this.loadCategories();
        this.loadAllProviders();
        this.setupSearch();
        this.setupCategorySearch();
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
                this.totalProviders = response.meta.pagination.total;
                // Aplicar filtros y búsqueda si hay término de búsqueda activo
                const searchQuery = this.searchControl.value?.trim();
                if (searchQuery) {
                    this.searchInCache(searchQuery);
                } else {
                    this.applyFilters();
                }
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
                if (query && query.trim()) {
                    this.searchInCache(query.trim());
                } else {
                    // Si no hay búsqueda, aplicar solo los filtros activos
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
     * Buscar proveedores en la caché (proveedores ya cargados)
     * No hace petición al API, solo filtra localmente
     */
    searchInCache(query: string): void {
        const searchTerm = query.toLowerCase().trim();
        
        // Usar los proveedores completos para búsqueda más exhaustiva
        let sourceProviders = this.providersFull.length > 0 
            ? this.providersFull 
            : this.providers;

        // Filtrar por término de búsqueda en los objetos completos
        let filteredFull = sourceProviders.filter((provider: any) => {
            // Buscar en el nombre
            const nameMatch = provider.name?.toLowerCase().includes(searchTerm) || false;
            
            // Buscar en descripción
            const descriptionMatch = provider.description?.toLowerCase().includes(searchTerm) || false;
            
            // Buscar en área de servicio
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
            populate: '*',
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
                // Aplicar búsqueda si hay término de búsqueda activo
                const searchQuery = this.searchControl.value?.trim();
                if (searchQuery) {
                    this.searchInCache(searchQuery);
                } else {
                    this.filteredProviders = [...this.providers]; // Mostrar todos ya que vienen filtrados del servidor
                }
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
     */
    applyFilters(): void {
        // Si hay cualquier filtro activo, usar el método que hace petición al API
        if (this.selectedSubcategory || 
            this.minRating > 0 || 
            this.showOnlyVerified || 
            this.selectedPriceRange) {
            this.loadProvidersWithFilters();
            return;
        }

        // Si no hay filtros, simplemente mostrar todos los proveedores
        this.filteredProviders = [...this.providers];
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
                photoUrl = `${API_CONFIG.baseUrl}${url}`;
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
}
