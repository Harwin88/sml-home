import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, API_URL } from '../config/api.config';
import { CreateReviewDTO } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly endpoint = '/reviews';

  constructor(private http: HttpClient) {}

  /**
   * Enviar una reseña/calificación
   * Por ahora enviamos a un endpoint de reviews, pero si no existe,
   * podríamos crear un endpoint personalizado en service-provider
   */
  submitReview(review: CreateReviewDTO): Observable<any> {
    const url = `${API_URL}${this.endpoint}`;
    const headers: any = {};
    
    // Agregar API key si está configurada
    if (API_CONFIG.strapiKey) {
      headers['Authorization'] = `Bearer ${API_CONFIG.strapiKey}`;
    }

    return this.http.post(url, {
      data: {
        serviceProvider: review.serviceProviderId,
        rating: review.rating,
        comment: review.comment,
        reviewerName: review.reviewerName,
        reviewerEmail: review.reviewerEmail,
        reviewerPhone: review.reviewerPhone
      }
    }, { headers });
  }

  /**
   * Alternativa: Enviar reseña a través de un endpoint personalizado del service-provider
   * Si el endpoint de reviews no existe, podemos usar este método
   */
  submitReviewToProvider(review: CreateReviewDTO): Observable<any> {
    const url = `${API_URL}/service-providers/${review.serviceProviderId}/review`;
    const headers: any = {};
    
    if (API_CONFIG.strapiKey) {
      headers['Authorization'] = `Bearer ${API_CONFIG.strapiKey}`;
    }

    return this.http.post(url, {
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail,
      reviewerPhone: review.reviewerPhone
    }, { headers });
  }
}

