import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AnalyticsService } from '../../core/services/analytics.service';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  icon: string;
}

interface HelpCategory {
  name: string;
  icon: string;
  description: string;
  route?: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './help.component.html',
  styleUrls: ['./support.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class HelpComponent implements OnInit {
  expandedIndex: number | null = null;
  selectedCategory: string = 'all';

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    // Track page view
    this.analytics.trackPageView('/help', 'Centro de Ayuda');
  }

  categories: HelpCategory[] = [
    {
      name: 'General',
      icon: 'info',
      description: 'Información general sobre MSL Hogar'
    },
    {
      name: 'Búsqueda',
      icon: 'search',
      description: 'Cómo buscar y encontrar profesionales'
    },
    {
      name: 'Pagos',
      icon: 'payment',
      description: 'Métodos de pago y facturación'
    },
    {
      name: 'Seguridad',
      icon: 'security',
      description: 'Verificación y confianza'
    },
    {
      name: 'Cuenta',
      icon: 'account_circle',
      description: 'Gestión de tu cuenta'
    }
  ];

  faqs: FAQ[] = [
    // General
    {
      category: 'General',
      icon: 'help',
      question: '¿Qué es MSL Hogar?',
      answer: 'MSL Hogar es una plataforma digital que conecta familias colombianas con profesionales verificados para servicios del hogar. Facilitamos el encuentro entre usuarios que necesitan servicios de limpieza, plomería, electricidad, jardinería y más, con proveedores calificados y de confianza.'
    },
    {
      category: 'General',
      icon: 'location_on',
      question: '¿En qué ciudades están disponibles?',
      answer: 'Actualmente operamos en las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira y Armenia. Estamos expandiéndonos continuamente a nuevas ciudades.'
    },
    {
      category: 'General',
      icon: 'schedule',
      question: '¿Cuál es el horario de atención?',
      answer: 'Nuestra plataforma está disponible 24/7 para buscar y contactar profesionales. Nuestro equipo de soporte está disponible de lunes a viernes de 8:00 AM a 6:00 PM (hora de Colombia). Para emergencias fuera de horario, contamos con un sistema de respuesta automática.'
    },
    {
      category: 'General',
      icon: 'monetization_on',
      question: '¿Cuánto cuesta usar la plataforma?',
      answer: 'Buscar y contactar profesionales es completamente gratis para los usuarios. Solo pagas directamente al profesional por el servicio contratado. No cobramos comisiones ocultas ni tarifas de intermediación.'
    },

    // Búsqueda
    {
      category: 'Búsqueda',
      icon: 'search',
      question: '¿Cómo busco un profesional?',
      answer: 'Usa nuestra barra de búsqueda en la página principal. Puedes buscar por tipo de servicio (ej: "plomero", "electricista") o por descripción del problema. Luego filtra por ubicación, precio, disponibilidad y calificaciones para encontrar el profesional ideal.'
    },
    {
      category: 'Búsqueda',
      icon: 'filter_alt',
      question: '¿Cómo funcionan los filtros de búsqueda?',
      answer: 'Puedes filtrar por: ubicación (ciudad o barrio), rango de precios, disponibilidad (inmediata, hoy, esta semana), calificación mínima (1-5 estrellas), tipo de servicio, experiencia del profesional y si ha sido verificado por MSL Hogar.'
    },
    {
      category: 'Búsqueda',
      icon: 'star',
      question: '¿Qué significan las calificaciones?',
      answer: 'Las calificaciones (1-5 estrellas) son opiniones reales de usuarios que han contratado los servicios. Solo usuarios que han completado un servicio pueden dejar una calificación. Verificamos que todas las reseñas sean auténticas.'
    },
    {
      category: 'Búsqueda',
      icon: 'verified',
      question: '¿Qué significa "Proveedor Verificado"?',
      answer: 'Los proveedores verificados han completado nuestro proceso de validación que incluye: verificación de identidad, antecedentes penales, certificaciones profesionales (cuando aplica), referencias comprobables y una entrevista con nuestro equipo.'
    },

    // Pagos
    {
      category: 'Pagos',
      icon: 'payment',
      question: '¿Cómo pago por los servicios?',
      answer: 'El pago se realiza directamente al profesional según el método acordado entre ambas partes. Los métodos más comunes son: efectivo al finalizar el servicio, transferencia bancaria, Nequi, Daviplata o tarjeta. Cada profesional indica sus métodos de pago aceptados en su perfil.'
    },
    {
      category: 'Pagos',
      icon: 'receipt',
      question: '¿Puedo solicitar factura?',
      answer: 'Sí, puedes solicitar factura directamente al profesional. Los proveedores registrados como persona jurídica o régimen común están obligados a emitir factura electrónica. Verifica en el perfil del profesional si ofrece este servicio.'
    },
    {
      category: 'Pagos',
      icon: 'money_off',
      question: '¿Hay costos adicionales o comisiones?',
      answer: 'No. El precio que ves en el perfil del profesional es el precio base del servicio. No cobramos comisiones adicionales. Ten en cuenta que algunos servicios pueden tener costos variables según materiales o complejidad del trabajo, lo cual debe acordarse previamente.'
    },
    {
      category: 'Pagos',
      icon: 'local_offer',
      question: '¿Ofrecen descuentos o promociones?',
      answer: 'Sí, frecuentemente tenemos promociones especiales, descuentos para primeros servicios y ofertas en servicios recurrentes. Suscríbete a nuestro newsletter para recibir notificaciones de promociones exclusivas.'
    },

    // Seguridad
    {
      category: 'Seguridad',
      icon: 'shield',
      question: '¿Cómo garantizan la seguridad?',
      answer: 'Implementamos múltiples medidas: verificación de antecedentes de todos los profesionales, sistema de calificaciones transparente, soporte 24/7, seguro de responsabilidad civil para incidentes, y un equipo dedicado que monitorea la calidad del servicio.'
    },
    {
      category: 'Seguridad',
      icon: 'policy',
      question: '¿Qué pasa si tengo un problema con un servicio?',
      answer: 'Contacta inmediatamente a nuestro equipo de soporte. Investigaremos el caso, mediaremos entre ambas partes y, si corresponde, tomaremos acciones como advertencias, suspensión o eliminación del profesional de la plataforma. Tu satisfacción y seguridad son nuestra prioridad.'
    },
    {
      category: 'Seguridad',
      icon: 'privacy_tip',
      question: '¿Cómo protegen mis datos personales?',
      answer: 'Cumplimos estrictamente con la Ley 1581 de 2012 de Protección de Datos de Colombia. Tu información personal está encriptada, solo se comparte lo mínimo necesario para contactar profesionales, y nunca vendemos tus datos a terceros. Lee nuestra Política de Privacidad para más detalles.'
    },
    {
      category: 'Seguridad',
      icon: 'gpp_good',
      question: '¿Qué es el Seguro de Garantía?',
      answer: 'Es una cobertura opcional que algunos profesionales ofrecen para proteger contra daños materiales durante el servicio. Verifica en el perfil del profesional si cuenta con este seguro y qué cubre específicamente.'
    },

    // Cuenta
    {
      category: 'Cuenta',
      icon: 'person_add',
      question: '¿Necesito crear una cuenta para usar MSL Hogar?',
      answer: 'No es obligatorio para buscar profesionales, pero crear una cuenta te permite: guardar tus búsquedas favoritas, contactar directamente a profesionales, ver tu historial de servicios, recibir notificaciones personalizadas y dejar calificaciones.'
    },
    {
      category: 'Cuenta',
      icon: 'edit',
      question: '¿Cómo edito mi perfil?',
      answer: 'Inicia sesión, ve a "Mi Cuenta" en el menú superior, y selecciona "Editar Perfil". Puedes actualizar tu información personal, preferencias de contacto, dirección y métodos de pago preferidos.'
    },
    {
      category: 'Cuenta',
      icon: 'delete',
      question: '¿Puedo eliminar mi cuenta?',
      answer: 'Sí, puedes solicitar la eliminación de tu cuenta en cualquier momento. Ve a Configuración > Privacidad > Eliminar Cuenta. Ten en cuenta que esto eliminará permanentemente tu historial, calificaciones y datos personales según nuestra política de retención de datos.'
    },
    {
      category: 'Cuenta',
      icon: 'work',
      question: '¿Cómo puedo trabajar como profesional en MSL Hogar?',
      answer: 'Si eres un profesional de servicios del hogar, haz clic en "Trabaja con Nosotros" en el menú principal. Completa el formulario de registro, proporciona tu documentación y certificaciones, y nuestro equipo revisará tu solicitud en 2-3 días hábiles.'
    }
  ];

  get filteredFaqs(): FAQ[] {
    if (this.selectedCategory === 'all') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  toggleFaq(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.expandedIndex = null;
  }
}

