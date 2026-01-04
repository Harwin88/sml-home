import { StrapiDocument, StrapiRelation } from './strapi-response.model';

export interface Category extends StrapiDocument {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order: number;
    isActive: boolean;

    // Relaciones
    parent?: StrapiRelation<Category>;
    children?: StrapiRelation<Category[]>;
    service_providers?: StrapiRelation<any[]>;
}

// DTO para crear/actualizar
export interface CreateCategoryDTO {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
    parent?: string; // documentId del padre
}

// Vista simplificada para UI
export interface CategoryView {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order: number;
    subcategories?: CategoryView[];
}
