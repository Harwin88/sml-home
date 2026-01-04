import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StrapiBaseService, QueryParams } from './strapi-base.service';
import { Category, CategoryView, CreateCategoryDTO } from '../models/category.model';
import { StrapiCollectionResponse, StrapiSingleResponse } from '../models/strapi-response.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class CategoryService extends StrapiBaseService {

    private readonly endpoint = API_CONFIG.endpoints.categories;

    /**
     * Obtener todas las categorías
     */
    getAll(params?: QueryParams): Observable<StrapiCollectionResponse<Category>> {
        return this.getCollection<Category>(this.endpoint, params);
    }

    /**
     * Obtener categorías principales (sin padre)
     */
    getMainCategories(): Observable<Category[]> {
        const params: QueryParams = {
            filters: {
                parent: { $null: true }
            },
            populate: ['children', 'children.children'], // Populate anidado para obtener todos los niveles
            sort: ['order:asc']
        };

        return this.getAll(params).pipe(
            map(response => response.data)
        );
    }

    /**
     * Obtener subcategorías de una categoría
     */
    getSubcategories(parentDocumentId: string): Observable<Category[]> {
        const params: QueryParams = {
            filters: {
                parent: { documentId: { $eq: parentDocumentId } }
            },
            sort: ['order:asc']
        };

        return this.getAll(params).pipe(
            map(response => response.data)
        );
    }

    /**
     * Obtener una categoría por documentId
     */
    getById(documentId: string, populate = true): Observable<Category> {
        const params: QueryParams = populate ? { populate: '*' } : {};

        return this.getSingle<Category>(this.endpoint, documentId, params).pipe(
            map(response => response.data)
        );
    }

    /**
     * Obtener categoría por slug
     */
    getBySlug(slug: string): Observable<Category | null> {
        const params: QueryParams = {
            filters: { slug: { $eq: slug } },
            populate: ['children', 'parent']
        };

        return this.getAll(params).pipe(
            map(response => response.data.length > 0 ? response.data[0] : null)
        );
    }

    /**
     * Árbol completo de categorías (para menús)
     */
    getCategoryTree(): Observable<CategoryView[]> {
        return this.getMainCategories().pipe(
            map(categories => this.buildCategoryTree(categories))
        );
    }

    /**
     * Obtener solo categorías nodo hoja (sin hijos) para filtros
     * Obtiene todas las categorías activas y filtra las que no tienen hijos
     */
    getLeafCategories(): Observable<CategoryView[]> {
        // Primero intentar obtener todas las categorías con relaciones
        const params: QueryParams = {
            filters: {
                isActive: { $eq: true }
            },
            populate: ['children'], // Populate children para verificar si tienen hijos
            sort: ['order:asc']
        };

        return this.getAll(params).pipe(
            map(response => {
                // Filtrar solo las que no tienen hijos (nodos hoja)
                const leafCategories = response.data.filter(cat => 
                    !cat.children || !cat.children.data || 
                    (Array.isArray(cat.children.data) && cat.children.data.length === 0)
                );

                // Convertir a CategoryView
                return leafCategories.map(cat => ({
                    id: cat.id,
                    documentId: cat.documentId,
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                    icon: cat.icon,
                    order: cat.order,
                    subcategories: []
                }));
            })
        );
    }

    /**
     * Helper: Extraer solo nodos hoja (sin hijos) del árbol
     */
    private extractLeafNodes(categories: CategoryView[]): CategoryView[] {
        const leafNodes: CategoryView[] = [];
        
        const traverse = (nodes: CategoryView[]) => {
            nodes.forEach(node => {
                if (!node.subcategories || node.subcategories.length === 0) {
                    // Es un nodo hoja
                    leafNodes.push(node);
                } else {
                    // Tiene hijos, recorrer recursivamente
                    traverse(node.subcategories);
                }
            });
        };
        
        traverse(categories);
        return leafNodes;
    }

    /**
     * Crear nueva categoría (requiere autenticación)
     */
    createCategory(data: CreateCategoryDTO): Observable<Category> {
        return this.create<Category>(this.endpoint, data).pipe(
            map(response => response.data)
        );
    }

    /**
     * Actualizar categoría (requiere autenticación)
     */
    updateCategory(documentId: string, data: Partial<CreateCategoryDTO>): Observable<Category> {
        return this.update<Category>(this.endpoint, documentId, data).pipe(
            map(response => response.data)
        );
    }

    /**
     * Eliminar categoría (requiere autenticación)
     */
    deleteCategory(documentId: string): Observable<Category> {
        return this.delete<Category>(this.endpoint, documentId).pipe(
            map(response => response.data)
        );
    }

    /**
     * Helper: Construir árbol de categorías
     */
    private buildCategoryTree(categories: Category[]): CategoryView[] {
        return categories.map(cat => ({
            id: cat.id,
            documentId: cat.documentId,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: cat.icon,
            order: cat.order,
            subcategories: cat.children?.data
                ? this.buildCategoryTree(cat.children.data as Category[])
                : []
        }));
    }
}
