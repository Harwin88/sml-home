import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StrapiBaseService, QueryParams } from './strapi-base.service';
import { ConfigService } from './config.service';
import { StrapiCollectionResponse, StrapiSingleResponse } from '../models/strapi-response.model';

export type FaqCategory = 'general' | 'search' | 'payments' | 'security' | 'account' | 'providers' | 'technical';

export interface Faq {
  id?: number; // Opcional porque los FAQs de fallback no tienen ID
  documentId?: string;
  question: string;
  answer: string;
  category: FaqCategory;
  icon?: string;
  order?: number;
  isPopular?: boolean;
  viewCount?: number;
  helpfulCount?: number;
  notHelpfulCount?: number;
  keywords?: string[];
  videoUrl?: string;
  relatedFaqs?: Faq[];
}

interface FaqCategoryResponse {
  success: boolean;
  category: string;
  count: number;
  data: Faq[];
}

interface FaqSearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: Faq[];
}

interface FaqStatsResponse {
  success: boolean;
  data: {
    total: number;
    totalViews: number;
    totalHelpful: number;
    totalNotHelpful: number;
    byCategory: Record<string, number>;
    popular: number;
    helpfulRate: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FaqService extends StrapiBaseService {

  constructor(
    protected override http: HttpClient,
    protected override configService: ConfigService
  ) {
    super(http, configService);
  }

  /**
   * Obtener todas las FAQs publicadas
   */
  getAllFaqs(params?: QueryParams): Observable<Faq[]> {
    return this.getCollection<Faq>('/faqs', params).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtener una FAQ por ID
   */
  getFaqById(id: number, params?: QueryParams): Observable<Faq | null> {
    return this.getSingle<Faq>('/faqs', id.toString(), params).pipe(
      map(response => response.data || null)
    );
  }

  /**
   * Obtener FAQs por categoría
   */
  getFaqsByCategory(category: FaqCategory): Observable<Faq[]> {
    return this.http.get<FaqCategoryResponse>(
      `${this.getApiUrl()}/faqs/category/${category}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error al obtener FAQs por categoría:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener FAQs populares
   */
  getPopularFaqs(): Observable<Faq[]> {
    return this.http.get<FaqCategoryResponse>(
      `${this.getApiUrl()}/faqs/popular`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error al obtener FAQs populares:', error);
        return of([]);
      })
    );
  }

  /**
   * Buscar FAQs por texto
   */
  searchFaqs(query: string): Observable<Faq[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    return this.http.get<FaqSearchResponse>(
      `${this.getApiUrl()}/faqs/search`,
      { 
        params: { q: query },
        headers: this.getHeaders()
      }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error al buscar FAQs:', error);
        return of([]);
      })
    );
  }

  /**
   * Incrementar contador de vistas de una FAQ
   */
  incrementView(id: number): Observable<{ viewCount: number }> {
    return this.http.post<{ success: boolean; viewCount: number }>(
      `${this.getApiUrl()}/faqs/${id}/view`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => ({ viewCount: response.viewCount || 0 })),
      catchError(error => {
        console.error('Error al incrementar vistas:', error);
        return of({ viewCount: 0 });
      })
    );
  }

  /**
   * Marcar FAQ como útil o no útil
   */
  markHelpful(id: number, helpful: boolean): Observable<{ helpfulCount: number; notHelpfulCount: number }> {
    return this.http.post<{
      success: boolean;
      data: { helpfulCount: number; notHelpfulCount: number };
    }>(
      `${this.getApiUrl()}/faqs/${id}/helpful`,
      { helpful },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || { helpfulCount: 0, notHelpfulCount: 0 }),
      catchError(error => {
        console.error('Error al marcar FAQ:', error);
        return of({ helpfulCount: 0, notHelpfulCount: 0 });
      })
    );
  }

  /**
   * Obtener estadísticas de FAQs (solo para admin)
   */
  getStats(): Observable<FaqStatsResponse['data'] | null> {
    return this.http.get<FaqStatsResponse>(
      `${this.getApiUrl()}/faqs/stats`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || null),
      catchError(error => {
        console.error('Error al obtener estadísticas:', error);
        return of(null);
      })
    );
  }

  /**
   * Crear una nueva FAQ (solo para admin)
   */
  createFaq(faqData: Partial<Faq>): Observable<Faq | null> {
    return this.create<Faq>('/faqs', faqData).pipe(
      map(response => response.data || null),
      catchError(error => {
        console.error('Error al crear FAQ:', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar una FAQ (solo para admin)
   */
  updateFaq(id: string, faqData: Partial<Faq>): Observable<Faq | null> {
    return this.update<Faq>('/faqs', id, faqData).pipe(
      map(response => response.data || null),
      catchError(error => {
        console.error('Error al actualizar FAQ:', error);
        throw error;
      })
    );
  }

  /**
   * Eliminar una FAQ (solo para admin)
   */
  deleteFaq(id: string): Observable<boolean> {
    return this.delete<Faq>('/faqs', id).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error al eliminar FAQ:', error);
        return of(false);
      })
    );
  }
}

