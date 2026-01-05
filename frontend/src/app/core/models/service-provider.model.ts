import { StrapiDocument, StrapiRelation } from './strapi-response.model';
import { Category } from './category.model';

export type PriceRange = 'economico' | 'moderado' | 'premium';

export interface Certification {
    name: string;
    issuer: string;
}

export interface ServiceProvider extends StrapiDocument {
    name: string;
    email?: string;
    phone: string;
    whatsapp?: string;
    address?: string;
    description?: string;

    // Campos profesionales
    experienceYears: number;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    isActive: boolean;

    // Información adicional
    priceRange: PriceRange;
    hourlyRate?: number;
    serviceArea?: string;
    availabilitySchedule?: any;
    certifications?: Certification[];

    // Relaciones
    photo?: StrapiRelation<any>;
    portfolio?: StrapiRelation<any[]>;
    categories?: StrapiRelation<Category[]>;
}

// DTO para crear/actualizar
export interface CreateServiceProviderDTO {
    name: string;
    email?: string;
    phone: string;
    whatsapp?: string;
    address?: string;
    description?: string;
    experienceYears?: number;
    priceRange?: PriceRange;
    hourlyRate?: number;
    serviceArea?: string;
    categories?: string[]; // documentIds de categorías
}

// Vista simplificada para listados
export interface ServiceProviderCard {
    id: number;
    documentId: string;
    name: string;
    phone: string;
    rating: number;
    totalReviews: number;
    experienceYears: number;
    priceRange: PriceRange;
    hourlyRate?: number;
    isVerified: boolean;
    photoUrl?: string;
    categories: string[]; // nombres de categorías
}
