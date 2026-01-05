import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StrapiBaseService } from './strapi-base.service';
import { CreateReviewDTO } from '../models/review.model';
import { Review } from '../models/review.model';
import { StrapiSingleResponse } from '../models/strapi-response.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService extends StrapiBaseService {
  private readonly endpoint = '/reviews';

  /**
   * Enviar una reseña/calificación al endpoint POST /api/reviews
   */
  submitReview(review: CreateReviewDTO): Observable<Review> {
    const reviewData = {
      serviceProvider: review.serviceProviderId, // ID de la relación
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail,
      reviewerPhone: review.reviewerPhone || undefined
    };

    return this.create<Review>(this.endpoint, reviewData).pipe(
      map(response => response.data)
    );
  }
}

