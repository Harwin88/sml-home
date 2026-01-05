export type FormType = 'contact' | 'service-request' | 'quote-request' | 'general';

export interface CreateFormDTO {
    formType: FormType;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    serviceProvider?: string; // documentId del proveedor si aplica
    ipAddress?: string; // IP del cliente obtenida desde el navegador
    userAgent?: string; // User agent del navegador
}

export interface Form {
    id: number;
    documentId: string;
    formType: FormType;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: 'new' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    additionalData?: any;
    ipAddress?: string;
    userAgent?: string;
    submittedAt?: string;
    resolvedAt?: string;
    notes?: string;
    serviceProvider?: any;
    createdAt: string;
    updatedAt: string;
}

