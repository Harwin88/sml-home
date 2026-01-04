export interface CreateReviewDTO {
    serviceProviderId: string; // documentId del proveedor
    rating: number; // 1-5
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
    reviewerPhone?: string; // Opcional
}

export interface Review {
    id: number;
    documentId: string;
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
    reviewerPhone?: string;
    createdAt: string;
    updatedAt: string;
}

