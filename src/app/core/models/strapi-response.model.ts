// Respuesta para múltiples items
export interface StrapiCollectionResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

// Respuesta para un solo item
export interface StrapiSingleResponse<T> {
    data: T;
    meta: {};
}

// Estructura base de un documento Strapi
export interface StrapiDocument {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    locale?: string;
}

// Para relaciones
export interface StrapiRelation<T> {
    data: T | T[] | null;
}
