import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, API_CONFIG } from '../config/api.config';
import { StrapiCollectionResponse, StrapiSingleResponse } from '../models/strapi-response.model';

export interface QueryParams {
    populate?: string | string[];
    filters?: any;
    sort?: string | string[];
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    locale?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StrapiBaseService {

    constructor(protected http: HttpClient) { }

    /**
     * Construye los headers HTTP con Authorization si hay API key
     */
    protected getHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        
        // Agregar API Token de Strapi si está configurado
        if (API_CONFIG.strapiKey) {
            headers = headers.set('Authorization', `Bearer ${API_CONFIG.strapiKey}`);
        }
        
        return headers;
    }

    /**
     * Construye HttpParams desde QueryParams
     */
    protected buildParams(params?: QueryParams): HttpParams {
        let httpParams = new HttpParams();

        if (!params) return httpParams;

        // Populate
        if (params.populate) {
            if (typeof params.populate === 'string') {
                if (params.populate === '*') {
                    httpParams = httpParams.set('populate', '*');
                } else {
                    httpParams = httpParams.set('populate', params.populate);
                }
            } else if (Array.isArray(params.populate)) {
                params.populate.forEach((field, index) => {
                    httpParams = httpParams.set(`populate[${index}]`, field);
                });
            } else if (typeof params.populate === 'object') {
                // Manejar populate como objeto: { photo: true, categories: true }
                Object.keys(params.populate).forEach(key => {
                    const populateObj = params.populate as Record<string, any>;
                    const value = populateObj[key];
                    if (value === true || value === '*') {
                        httpParams = httpParams.set(`populate[${key}]`, 'true');
                    }
                });
            }
        }

        // Filters - función recursiva para manejar filtros anidados
        if (params.filters) {
            httpParams = this.addFiltersToParams(httpParams, params.filters, 'filters');
        }

        // Sort
        if (params.sort) {
            if (typeof params.sort === 'string') {
                httpParams = httpParams.set('sort', params.sort);
            } else {
                params.sort.forEach((field, index) => {
                    httpParams = httpParams.set(`sort[${index}]`, field);
                });
            }
        }

        // Pagination
        if (params.pagination) {
            if (params.pagination.page) {
                httpParams = httpParams.set('pagination[page]', params.pagination.page.toString());
            }
            if (params.pagination.pageSize) {
                httpParams = httpParams.set('pagination[pageSize]', params.pagination.pageSize.toString());
            }
        }

        // Locale
        if (params.locale) {
            httpParams = httpParams.set('locale', params.locale);
        }

        return httpParams;
    }

    /**
     * Función recursiva para agregar filtros anidados a los parámetros HTTP
     * Maneja casos como: filters[categories][slug][$eq]=plomeria
     */
    private addFiltersToParams(params: HttpParams, filters: any, prefix: string): HttpParams {
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            const paramKey = `${prefix}[${key}]`;

            if (value === null || value === undefined) {
                return;
            }

            // Si es un objeto, seguir anidando
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                // Verificar si tiene operadores de Strapi ($eq, $ne, $contains, etc.)
                const hasStrapiOperator = Object.keys(value).some(k => k.startsWith('$'));
                
                if (hasStrapiOperator) {
                    // Es un operador de Strapi, agregarlo directamente
                    Object.keys(value).forEach(operator => {
                        const operatorValue = value[operator];
                        if (operatorValue !== null && operatorValue !== undefined) {
                            params = params.set(`${paramKey}[${operator}]`, String(operatorValue));
                        }
                    });
                } else {
                    // Seguir anidando
                    params = this.addFiltersToParams(params, value, paramKey);
                }
            } 
            // Si es un array, puede ser un $in, $notIn, etc.
            else if (Array.isArray(value)) {
                params = params.set(paramKey, value.join(','));
            }
            // Valor primitivo
            else {
                params = params.set(paramKey, String(value));
            }
        });

        return params;
    }

    /**
     * GET genérico para colecciones
     */
    protected getCollection<T>(
        endpoint: string,
        params?: QueryParams
    ): Observable<StrapiCollectionResponse<T>> {
        return this.http.get<StrapiCollectionResponse<T>>(
            `${API_URL}${endpoint}`,
            { 
                params: this.buildParams(params),
                headers: this.getHeaders()
            }
        );
    }

    /**
     * GET genérico para un solo documento
     */
    protected getSingle<T>(
        endpoint: string,
        documentId: string,
        params?: QueryParams
    ): Observable<StrapiSingleResponse<T>> {
        return this.http.get<StrapiSingleResponse<T>>(
            `${API_URL}${endpoint}/${documentId}`,
            { 
                params: this.buildParams(params),
                headers: this.getHeaders()
            }
        );
    }

    /**
     * POST genérico para crear
     */
    protected create<T>(
        endpoint: string,
        data: any
    ): Observable<StrapiSingleResponse<T>> {
        return this.http.post<StrapiSingleResponse<T>>(
            `${API_URL}${endpoint}`,
            { data },
            { headers: this.getHeaders() }
        );
    }

    /**
     * PUT genérico para actualizar
     */
    protected update<T>(
        endpoint: string,
        documentId: string,
        data: any
    ): Observable<StrapiSingleResponse<T>> {
        return this.http.put<StrapiSingleResponse<T>>(
            `${API_URL}${endpoint}/${documentId}`,
            { data },
            { headers: this.getHeaders() }
        );
    }

    /**
     * DELETE genérico
     */
    protected delete<T>(
        endpoint: string,
        documentId: string
    ): Observable<StrapiSingleResponse<T>> {
        return this.http.delete<StrapiSingleResponse<T>>(
            `${API_URL}${endpoint}/${documentId}`,
            { headers: this.getHeaders() }
        );
    }
}
