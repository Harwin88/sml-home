import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StrapiBaseService, QueryParams } from './strapi-base.service';
import {
    ServiceProvider,
    ServiceProviderCard,
    CreateServiceProviderDTO
} from '../models/service-provider.model';
import { StrapiCollectionResponse } from '../models/strapi-response.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class ServiceProviderService extends StrapiBaseService {

    private readonly endpoint = API_CONFIG.endpoints.serviceProviders;

    /**
     * Obtener todos los proveedores
     */
    getAll(params?: QueryParams): Observable<StrapiCollectionResponse<ServiceProvider>> {
        // Si no se especifica populate, usar '*' para obtener todo
        const finalParams = params || {};
        if (!finalParams.populate) {
            finalParams.populate = '*';
        }
        return this.getCollection<ServiceProvider>(this.endpoint, finalParams);
    }

    /**
     * Obtener proveedor por ID
     */
    getById(documentId: string): Observable<ServiceProvider> {
        const params: QueryParams = {
            populate: '*' // Usar populate=* para obtener todo (photo, portfolio, categories)
        };

        return this.getSingle<ServiceProvider>(this.endpoint, documentId, params).pipe(
            map(response => response.data)
        );
    }

    /**
     * Obtener proveedores por categoría
     */
    getByCategory(categorySlug: string, page = 1, pageSize = 10): Observable<ServiceProviderCard[]> {
        const params: QueryParams = {
            filters: {
                categories: {
                    slug: { $eq: categorySlug }
                },
                isActive: { $eq: true }
            },
            populate: '*', // Usar populate=* para obtener todo
            sort: ['rating:desc'],
            pagination: { page, pageSize }
        };

        return this.getAll(params).pipe(
            map(response => response.data.map(provider => this.toCard(provider)))
        );
    }

    /**
     * Obtener proveedores verificados
     */
    getVerifiedProviders(page = 1, pageSize = 10): Observable<ServiceProviderCard[]> {
        const params: QueryParams = {
            filters: {
                isVerified: { $eq: true },
                isActive: { $eq: true }
            },
            populate: '*', // Usar populate=* para obtener todo
            sort: ['rating:desc', 'totalReviews:desc'],
            pagination: { page, pageSize }
        };

        return this.getAll(params).pipe(
            map(response => response.data.map(provider => this.toCard(provider)))
        );
    }

    /**
     * Buscar proveedores
     */
    search(query: string, page = 1, pageSize = 10): Observable<ServiceProviderCard[]> {
        const params: QueryParams = {
            filters: {
                $or: [
                    { name: { $containsi: query } },
                    { description: { $containsi: query } },
                    { serviceArea: { $containsi: query } }
                ],
                isActive: { $eq: true }
            },
            populate: '*', // Usar populate=* para obtener todo
            pagination: { page, pageSize }
        };

        return this.getAll(params).pipe(
            map(response => response.data.map(provider => this.toCard(provider)))
        );
    }

    /**
     * Filtrar por rating mínimo
     */
    getByMinRating(
        minRating: number,
        categorySlug?: string
    ): Observable<ServiceProviderCard[]> {
        const filters: any = {
            rating: { $gte: minRating },
            isActive: { $eq: true }
        };

        if (categorySlug) {
            filters.categories = { slug: { $eq: categorySlug } };
        }

        const params: QueryParams = {
            filters,
            populate: '*', // Usar populate=* para obtener todo
            sort: ['rating:desc']
        };

        return this.getAll(params).pipe(
            map(response => response.data.map(provider => this.toCard(provider)))
        );
    }

    /**
     * Crear proveedor (requiere autenticación)
     */
    createProvider(data: CreateServiceProviderDTO): Observable<ServiceProvider> {
        return this.create<ServiceProvider>(this.endpoint, data).pipe(
            map(response => response.data)
        );
    }

    /**
     * Actualizar proveedor (requiere autenticación)
     */
    updateProvider(documentId: string, data: Partial<CreateServiceProviderDTO>): Observable<ServiceProvider> {
        return this.update<ServiceProvider>(this.endpoint, documentId, data).pipe(
            map(response => response.data)
        );
    }

    /**
     * Eliminar proveedor (requiere autenticación)
     */
    deleteProvider(documentId: string): Observable<ServiceProvider> {
        return this.delete<ServiceProvider>(this.endpoint, documentId).pipe(
            map(response => response.data)
        );
    }

    /**
     * Helper: Convertir a tarjeta para listados
     */
    private toCard(provider: ServiceProvider): ServiceProviderCard {
        // photo viene directamente como objeto (no dentro de data) cuando se usa populate=*
        const photo = (provider as any).photo;
        const categories = (provider as any).categories || [];
        
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
            
            photoUrl: photo?.url ? this.getMediaUrl(photo) : undefined,
            categories: Array.isArray(categories) 
                ? categories.map((cat: any) => cat.name || cat)
                : []
        };
    }

    /**
     * Helper: Obtener URL de media
     * Construye la URL completa usando apiUrl + url del media
     */
    private getMediaUrl(media: any): string {
        if (!media?.url) return '';
        
        // Si ya es una URL completa, retornarla
        if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
            return media.url;
        }
        
        // Construir URL completa: apiUrl + url
        // Ejemplo: http://localhost:1338 + /uploads/unnamed_2fb2245d0c.jpg
        return `${API_CONFIG.baseUrl}${media.url}`;
    }
}
