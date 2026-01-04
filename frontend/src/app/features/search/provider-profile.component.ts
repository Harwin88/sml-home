import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceProviderService } from '../../core/services/service-provider.service';
import { ServiceProvider } from '../../core/models/service-provider.model';
import { API_CONFIG } from '../../core/config/api.config';

@Component({
    selector: 'app-provider-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './provider-profile.component.html',
    styleUrls: ['./provider-profile.component.scss']
})
export class ProviderProfileComponent implements OnInit {
    provider: ServiceProvider | null = null;
    loading = false;
    error = '';
    router = this.routerService;

    constructor(
        private route: ActivatedRoute,
        private routerService: Router,
        private providerService: ServiceProviderService
    ) { }

    ngOnInit(): void {
        const documentId = this.route.snapshot.paramMap.get('id');
        if (documentId) {
            this.loadProvider(documentId);
        } else {
            this.error = 'ID de proveedor no válido';
        }
    }

    loadProvider(documentId: string): void {
        this.loading = true;
        this.error = '';

        this.providerService.getById(documentId).subscribe({
            next: (provider) => {
                this.provider = provider;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Error al cargar el perfil del proveedor';
                console.error(err);
                this.loading = false;
            }
        });
    }

    /**
     * Abrir WhatsApp con el número del proveedor
     */
    openWhatsApp(): void {
        if (this.provider?.whatsapp) {
            const phone = this.provider.whatsapp.replace(/\D/g, ''); // Solo números
            const message = encodeURIComponent(`Hola ${this.provider.name}, me interesa tu servicio.`);
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        } else if (this.provider?.phone) {
            const phone = this.provider.phone.replace(/\D/g, ''); // Solo números
            const message = encodeURIComponent(`Hola ${this.provider.name}, me interesa tu servicio.`);
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }
    }

    /**
     * Llamar al proveedor
     */
    callProvider(): void {
        if (this.provider?.phone) {
            window.location.href = `tel:${this.provider.phone}`;
        }
    }

    /**
     * Enviar email
     */
    sendEmail(): void {
        if (this.provider?.email) {
            window.location.href = `mailto:${this.provider.email}?subject=Consulta sobre servicios`;
        }
    }

    /**
     * Obtener URL de la foto
     * Con populate=*, photo viene directamente como objeto (no dentro de data)
     */
    getPhotoUrl(): string {
        const photo = (this.provider as any)?.photo;
        if (photo?.url) {
            const url = photo.url;
            // Si ya es una URL completa, retornarla
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            // Construir URL completa: apiUrl + url
            return `${API_CONFIG.baseUrl}${url}`;
        }
        return 'assets/default-avatar.png';
    }

    /**
     * Obtener texto del rango de precio
     */
    getPriceRangeText(): string {
        const ranges: { [key: string]: string } = {
            'economico': 'Económico',
            'moderado': 'Moderado',
            'premium': 'Premium'
        };
        return ranges[this.provider?.priceRange || ''] || this.provider?.priceRange || '';
    }

    /**
     * Generar estrellas para el rating
     */
    getStars(): boolean[] {
        const rating = this.provider?.rating || 0;
        return Array(5).fill(false).map((_, i) => i < Math.round(rating));
    }

    /**
     * Obtener URL de WhatsApp
     */
    getWhatsAppUrl(): string {
        if (this.provider?.whatsapp) {
            const phone = this.provider.whatsapp.replace(/\D/g, ''); // Solo números
            return `https://wa.me/${phone}`;
        } else if (this.provider?.phone) {
            const phone = this.provider.phone.replace(/\D/g, ''); // Solo números
            return `https://wa.me/${phone}`;
        }
        return '#';
    }

    /**
     * Obtener categorías de forma segura
     * Con populate=*, categories viene directamente como array (no dentro de data)
     */
    getCategories(): any[] {
        const categories = (this.provider as any)?.categories;
        if (Array.isArray(categories) && categories.length > 0) {
            return categories;
        }
        return [];
    }

    /**
     * Verificar si hay horario de disponibilidad
     */
    hasAvailabilitySchedule(): boolean {
        if (!this.provider?.availabilitySchedule) {
            return false;
        }
        return Object.keys(this.provider.availabilitySchedule).length > 0;
    }
}

