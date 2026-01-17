import { Injectable } from '@angular/core';
import { Observable, map, catchError, of, switchMap, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigService } from './config.service';
import { API_CONFIG, getApiUrl } from '../config/api.config';
import { ServiceProvider } from '../models/service-provider.model';
import { ServiceProviderService } from './service-provider.service';

export interface FeaturedProviderResponse {
    id: number;
    documentId: string;
    providerId: string; // documentId del provider
    order: number;
    isActive: boolean;
    featuredText?: string;
    startDate?: string;
    endDate?: string;
}

export interface FeaturedProvider {
    id: number;
    provider: ServiceProvider;
    order: number;
    isActive: boolean;
    featuredText?: string;
    startDate?: string;
    endDate?: string;
}

export interface FeaturedProvidersResponse {
    providers: FeaturedProvider[];
    currentIndex: number;
    total: number;
}

@Injectable({
    providedIn: 'root'
})
export class FeaturedProviderService {

    constructor(
        private http: HttpClient,
        private configService: ConfigService,
        private serviceProviderService: ServiceProviderService
    ) {}

    /**
     * Obtener todos los proveedores destacados activos
     * Devuelve un array de proveedores destacados con sus datos completos
     */
    getAll(): Observable<FeaturedProvider[]> {
        const apiUrl = getApiUrl(this.configService);
        const endpoint = `${apiUrl}${API_CONFIG.endpoints.featuredProviders}`;
        
        // Construir parámetros de query usando HttpParams
        // Obtener TODOS los proveedores destacados activos (sin límite)
        let params = new HttpParams()
            .set('filters[isActive][$eq]', 'true')
            .set('sort[0]', 'order:asc')
            .set('populate[provider][fields][0]', 'documentId');
        
        console.log('Fetching featured provider from:', endpoint, 'with params:', params.toString());
        
        // Construir headers con Bearer token si está disponible
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        
        // Agregar API Token de Strapi si está configurado
        const strapiKey = this.configService.strapiKey;
        if (strapiKey) {
            headers = headers.set('Authorization', `Bearer ${strapiKey}`);
        }

        return this.http.get<{ data: FeaturedProviderResponse[] }>(endpoint, { headers, params }).pipe(
            switchMap(response => {
                console.log('Featured providers response:', response);
                
                // El endpoint devuelve un array
                if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
                    console.log('No hay proveedores destacados activos');
                    return of([]);
                }

                console.log(`Found ${response.data.length} featured providers`);

                // Obtener los datos completos de cada provider
                const providerRequests = response.data.map(featuredData => {
                    const provider = (featuredData as any).provider;
                    const providerId = provider?.documentId || provider?.id;

                    if (!providerId) {
                        console.log('No se encontró providerId en featured provider:', featuredData.id);
                        return of(null);
                    }

                    // Obtener los datos completos del provider
                    return this.serviceProviderService.getById(providerId).pipe(
                        map(providerDetails => {
                            return {
                                id: featuredData.id,
                                provider: providerDetails,
                                order: featuredData.order,
                                isActive: featuredData.isActive,
                                featuredText: featuredData.featuredText,
                                startDate: featuredData.startDate,
                                endDate: featuredData.endDate
                            } as FeaturedProvider;
                        }),
                        catchError(providerError => {
                            console.error('Error loading provider details:', providerError);
                            return of(null);
                        })
                    );
                });

                // Combinar todas las peticiones y filtrar nulos
                return forkJoin(providerRequests).pipe(
                    map(providers => providers.filter(p => p !== null) as FeaturedProvider[])
                );
            }),
            catchError(err => {
                console.error('Error loading featured providers:', err);
                console.error('Error details:', {
                    status: err.status,
                    statusText: err.statusText,
                    message: err.message,
                    url: endpoint,
                    params: params.toString()
                });
                // Si es 404, no es un error crítico, simplemente no hay destacados
                if (err.status === 404) {
                    console.log('No hay proveedores destacados activos (404)');
                    return of([]);
                }
                return of([]);
            })
        );
    }
}

