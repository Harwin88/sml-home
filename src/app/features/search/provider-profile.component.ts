import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ServiceProviderService } from '../../core/services/service-provider.service';
import { ReviewService } from '../../core/services/review.service';
import { RatingModalComponent } from '../../shared/components/rating-modal/rating-modal.component';
import { ServiceProvider } from '../../core/models/service-provider.model';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
    selector: 'app-provider-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, RatingModalComponent],
    templateUrl: './provider-profile.component.html',
    styleUrls: ['./provider-profile.component.scss']
})
export class ProviderProfileComponent implements OnInit {
    provider: ServiceProvider | null = null;
    loading = false;
    error = '';
    router = this.routerService;
    showRatingModal = false;

    constructor(
        private route: ActivatedRoute,
        private routerService: Router,
        private providerService: ServiceProviderService,
        private reviewService: ReviewService,
        private configService: ConfigService,
        private authService: AuthService,
        private favoritesService: FavoritesService
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
            return `${this.configService.apiUrl}${url}`;
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
     * Formatear precio en formato colombiano
     */
    formatPrice(price: number): string {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
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

    /**
     * Obtener horarios de disponibilidad ordenados por día de la semana
     */
    getAvailabilitySchedule(): Array<{ day: string; hours: string; dayOrder: number }> {
        if (!this.provider?.availabilitySchedule) {
            return [];
        }

        const schedule = this.provider.availabilitySchedule;
        const dayOrder: { [key: string]: number } = {
            'lunes': 1,
            'martes': 2,
            'miercoles': 3,
            'miércoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sabado': 6,
            'sábado': 6,
            'domingo': 7
        };

        const dayLabels: { [key: string]: string } = {
            'lunes': 'Lunes',
            'martes': 'Martes',
            'miercoles': 'Miércoles',
            'miércoles': 'Miércoles',
            'jueves': 'Jueves',
            'viernes': 'Viernes',
            'sabado': 'Sábado',
            'sábado': 'Sábado',
            'domingo': 'Domingo'
        };

        return Object.keys(schedule)
            .filter(day => schedule[day] && schedule[day].trim() !== '')
            .map(day => ({
                day: dayLabels[day.toLowerCase()] || day.charAt(0).toUpperCase() + day.slice(1),
                hours: schedule[day],
                dayOrder: dayOrder[day.toLowerCase()] || 99
            }))
            .sort((a, b) => a.dayOrder - b.dayOrder);
    }

    /**
     * Obtener certificaciones de forma segura
     * Las certificaciones vienen como array de objetos con name e issuer
     */
    getCertifications(): any[] {
        const certifications = (this.provider as any)?.certifications;
        if (Array.isArray(certifications) && certifications.length > 0) {
            // Filtrar certificaciones válidas (que tengan name)
            return certifications.filter((cert: any) => 
                cert && (typeof cert === 'object') && cert.name
            );
        }
        return [];
    }

    /**
     * Manejar error al cargar imagen - evita loops infinitos
     */
    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        const defaultAvatar = 'assets/default-avatar.png';
        
        // Solo cambiar si no es ya el default-avatar para evitar loops
        if (img.src && !img.src.includes(defaultAvatar)) {
            img.src = defaultAvatar;
            // Deshabilitar el handler de error después del primer fallo para evitar loops
            img.onerror = null;
        } else {
            // Si ya es el default-avatar y falla, usar un data URI transparente para evitar parpadeo
            img.onerror = null;
            img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1\' height=\'1\'%3E%3C/svg%3E';
        }
    }

    /**
     * Abrir modal de calificación
     */
    openRatingModal(): void {
        this.showRatingModal = true;
    }

    /**
     * Cerrar modal de calificación
     */
    closeRatingModal(): void {
        this.showRatingModal = false;
    }

    /**
     * Enviar calificación
     */
    onSubmitRating(reviewData: any): void {
        if (!this.provider) return;

        this.reviewService.submitReview(reviewData).subscribe({
            next: () => {
                // Éxito - podríamos mostrar un mensaje o recargar los datos
                alert('¡Gracias por tu calificación!');
                this.closeRatingModal();
                // Opcional: Recargar proveedor para actualizar ratings
                // this.loadProvider(this.provider!.documentId);
            },
            error: (err) => {
                console.error('Error al enviar calificación:', err);
                alert('Hubo un error al enviar tu calificación. Por favor intenta de nuevo.');
            }
        });
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    /**
     * Verificar si el proveedor está en favoritos
     */
    isFavorite(): boolean {
        if (!this.provider || !this.isAuthenticated()) {
            return false;
        }
        return this.favoritesService.isFavorite(this.provider.id);
    }

    /**
     * Toggle favorito (agregar o remover)
     */
    toggleFavorite(): void {
        if (!this.provider) return;

        if (!this.isAuthenticated()) {
            alert('Debes iniciar sesión para agregar favoritos');
            return;
        }

        if (this.isFavorite()) {
            // Remover de favoritos
            this.favoritesService.removeFavorite(this.provider.id).subscribe({
                next: () => {
                    this.authService.refreshUser().subscribe();
                },
                error: (error) => {
                    console.error('Error al remover favorito:', error);
                    alert('Error al remover de favoritos');
                }
            });
        } else {
            // Agregar a favoritos
            this.favoritesService.addFavorite(this.provider.id).subscribe({
                next: () => {
                    this.authService.refreshUser().subscribe();
                },
                error: (error) => {
                    console.error('Error al agregar favorito:', error);
                    alert('Error al agregar a favoritos');
                }
            });
        }
    }
}

