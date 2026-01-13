/**
 * Script para poblar FAQs iniciales en la base de datos
 * 
 * Ejecutar: npm run strapi console
 * Luego en la consola: await require('./src/scripts/seed-faqs').default()
 */

type FaqCategory = 'general' | 'search' | 'payments' | 'security' | 'account' | 'providers' | 'technical';

interface FaqData {
  question: string;
  answer: string;
  category: FaqCategory;
  icon: string;
  order: number;
  isPopular?: boolean;
  keywords: string[];
}

const faqs: FaqData[] = [
  // General
  {
    question: '¿Qué es MSL Hogar?',
    answer: 'MSL Hogar es una plataforma digital que conecta familias colombianas con profesionales verificados para servicios del hogar. Facilitamos el encuentro entre usuarios que necesitan servicios de limpieza, plomería, electricidad, jardinería y más, con proveedores calificados y de confianza.',
    category: 'general',
    icon: 'help',
    order: 1,
    isPopular: true,
    keywords: ['plataforma', 'servicios', 'hogar', 'que es', 'descripción'],
  },
  {
    question: '¿En qué ciudades están disponibles?',
    answer: 'Actualmente operamos en las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira y Armenia. Estamos expandiéndonos continuamente a nuevas ciudades.',
    category: 'general',
    icon: 'location_on',
    order: 2,
    isPopular: true,
    keywords: ['ciudades', 'ubicación', 'disponibilidad', 'cobertura'],
  },
  {
    question: '¿Cuál es el horario de atención?',
    answer: 'Nuestra plataforma está disponible 24/7 para buscar y contactar profesionales. Nuestro equipo de soporte está disponible de lunes a viernes de 8:00 AM a 6:00 PM (hora de Colombia). Para emergencias fuera de horario, contamos con un sistema de respuesta automática.',
    category: 'general',
    icon: 'schedule',
    order: 3,
    keywords: ['horario', 'atención', 'disponibilidad', '24/7'],
  },
  {
    question: '¿Cuánto cuesta usar la plataforma?',
    answer: 'Buscar y contactar profesionales es completamente gratis para los usuarios. Solo pagas directamente al profesional por el servicio contratado. No cobramos comisiones ocultas ni tarifas de intermediación.',
    category: 'general',
    icon: 'monetization_on',
    order: 4,
    isPopular: true,
    keywords: ['costo', 'precio', 'gratis', 'tarifas', 'comisiones'],
  },

  // Búsqueda
  {
    question: '¿Cómo busco un profesional?',
    answer: 'Usa nuestra barra de búsqueda en la página principal. Puedes buscar por tipo de servicio (ej: "plomero", "electricista") o por descripción del problema. Luego filtra por ubicación, precio, disponibilidad y calificaciones para encontrar el profesional ideal.',
    category: 'search',
    icon: 'search',
    order: 1,
    isPopular: true,
    keywords: ['buscar', 'encontrar', 'profesional', 'servicio'],
  },
  {
    question: '¿Cómo funcionan los filtros de búsqueda?',
    answer: 'Puedes filtrar por: ubicación (ciudad o barrio), rango de precios, disponibilidad (inmediata, hoy, esta semana), calificación mínima (1-5 estrellas), tipo de servicio, experiencia del profesional y si ha sido verificado por MSL Hogar.',
    category: 'search',
    icon: 'filter_alt',
    order: 2,
    keywords: ['filtros', 'buscar', 'opciones', 'personalizar'],
  },
  {
    question: '¿Qué significan las calificaciones?',
    answer: 'Las calificaciones (1-5 estrellas) son opiniones reales de usuarios que han contratado los servicios. Solo usuarios que han completado un servicio pueden dejar una calificación. Verificamos que todas las reseñas sean auténticas.',
    category: 'search',
    icon: 'star',
    order: 3,
    isPopular: true,
    keywords: ['calificaciones', 'estrellas', 'reseñas', 'opiniones'],
  },
  {
    question: '¿Qué significa "Proveedor Verificado"?',
    answer: 'Los proveedores verificados han completado nuestro proceso de validación que incluye: verificación de identidad, antecedentes penales, certificaciones profesionales (cuando aplica), referencias comprobables y una entrevista con nuestro equipo.',
    category: 'search',
    icon: 'verified',
    order: 4,
    isPopular: true,
    keywords: ['verificado', 'certificado', 'confiable', 'validación'],
  },

  // Pagos
  {
    question: '¿Cómo pago por los servicios?',
    answer: 'El pago se realiza directamente al profesional según el método acordado entre ambas partes. Los métodos más comunes son: efectivo al finalizar el servicio, transferencia bancaria, Nequi, Daviplata o tarjeta. Cada profesional indica sus métodos de pago aceptados en su perfil.',
    category: 'payments',
    icon: 'payment',
    order: 1,
    isPopular: true,
    keywords: ['pago', 'métodos', 'efectivo', 'transferencia', 'nequi'],
  },
  {
    question: '¿Puedo solicitar factura?',
    answer: 'Sí, puedes solicitar factura directamente al profesional. Los proveedores registrados como persona jurídica o régimen común están obligados a emitir factura electrónica. Verifica en el perfil del profesional si ofrece este servicio.',
    category: 'payments',
    icon: 'receipt',
    order: 2,
    keywords: ['factura', 'recibo', 'comprobante'],
  },
  {
    question: '¿Hay costos adicionales o comisiones?',
    answer: 'No. El precio que ves en el perfil del profesional es el precio base del servicio. No cobramos comisiones adicionales. Ten en cuenta que algunos servicios pueden tener costos variables según materiales o complejidad del trabajo, lo cual debe acordarse previamente.',
    category: 'payments',
    icon: 'money_off',
    order: 3,
    keywords: ['costos', 'comisiones', 'adicionales', 'precio final'],
  },

  // Seguridad
  {
    question: '¿Cómo garantizan la seguridad?',
    answer: 'Implementamos múltiples medidas: verificación de antecedentes de todos los profesionales, sistema de calificaciones transparente, soporte 24/7, seguro de responsabilidad civil para incidentes, y un equipo dedicado que monitorea la calidad del servicio.',
    category: 'security',
    icon: 'shield',
    order: 1,
    isPopular: true,
    keywords: ['seguridad', 'protección', 'confianza', 'garantía'],
  },
  {
    question: '¿Qué pasa si tengo un problema con un servicio?',
    answer: 'Contacta inmediatamente a nuestro equipo de soporte. Investigaremos el caso, mediaremos entre ambas partes y, si corresponde, tomaremos acciones como advertencias, suspensión o eliminación del profesional de la plataforma. Tu satisfacción y seguridad son nuestra prioridad.',
    category: 'security',
    icon: 'policy',
    order: 2,
    isPopular: true,
    keywords: ['problema', 'queja', 'reclamo', 'soporte'],
  },
  {
    question: '¿Cómo protegen mis datos personales?',
    answer: 'Cumplimos estrictamente con la Ley 1581 de 2012 de Protección de Datos de Colombia. Tu información personal está encriptada, solo se comparte lo mínimo necesario para contactar profesionales, y nunca vendemos tus datos a terceros. Lee nuestra Política de Privacidad para más detalles.',
    category: 'security',
    icon: 'privacy_tip',
    order: 3,
    keywords: ['datos', 'privacidad', 'protección', 'información personal'],
  },

  // Cuenta
  {
    question: '¿Necesito crear una cuenta para usar MSL Hogar?',
    answer: 'No es obligatorio para buscar profesionales, pero crear una cuenta te permite: guardar tus búsquedas favoritas, contactar directamente a profesionales, ver tu historial de servicios, recibir notificaciones personalizadas y dejar calificaciones.',
    category: 'account',
    icon: 'person_add',
    order: 1,
    keywords: ['cuenta', 'registro', 'crear', 'necesario'],
  },
  {
    question: '¿Cómo edito mi perfil?',
    answer: 'Inicia sesión, ve a "Mi Cuenta" en el menú superior, y selecciona "Editar Perfil". Puedes actualizar tu información personal, preferencias de contacto, dirección y métodos de pago preferidos.',
    category: 'account',
    icon: 'edit',
    order: 2,
    keywords: ['editar', 'perfil', 'actualizar', 'modificar'],
  },
  {
    question: '¿Cómo puedo trabajar como profesional en MSL Hogar?',
    answer: 'Si eres un profesional de servicios del hogar, haz clic en "Trabaja con Nosotros" en el menú principal. Completa el formulario de registro, proporciona tu documentación y certificaciones, y nuestro equipo revisará tu solicitud en 2-3 días hábiles.',
    category: 'account',
    icon: 'work',
    order: 3,
    isPopular: true,
    keywords: ['trabajar', 'proveedor', 'profesional', 'unirse', 'registrarse'],
  },
];

export default async function seedFaqs() {
  try {
    console.log('🌱 Iniciando seed de FAQs...');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const faqData of faqs) {
      // Buscar FAQ existente por pregunta
      const existing = await strapi.db.query('api::faq.faq').findOne({
        where: { question: faqData.question },
      });

      if (existing) {
        // Verificar si hay cambios
        if (
          existing.answer !== faqData.answer ||
          existing.category !== faqData.category ||
          existing.order !== faqData.order
        ) {
          await strapi.entityService.update('api::faq.faq', existing.id, {
            data: {
              question: faqData.question,
              answer: faqData.answer,
              category: faqData.category,
              icon: faqData.icon,
              order: faqData.order,
              isPopular: faqData.isPopular || false,
              keywords: faqData.keywords,
            } as any,
          });
          console.log(`✅ FAQ actualizada: "${faqData.question}"`);
          updated++;
        } else {
          console.log(`⏭️  FAQ sin cambios: "${faqData.question}"`);
          skipped++;
        }
      } else {
        // Crear nueva FAQ
        await strapi.entityService.create('api::faq.faq', {
          data: {
            question: faqData.question,
            answer: faqData.answer,
            category: faqData.category,
            icon: faqData.icon,
            order: faqData.order,
            isPopular: faqData.isPopular || false,
            keywords: faqData.keywords,
            publishedAt: new Date(),
          } as any,
        });
        console.log(`✨ FAQ creada: "${faqData.question}"`);
        created++;
      }
    }

    console.log('\n📊 Resumen del seed:');
    console.log(`   ✨ Creadas: ${created}`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⏭️  Sin cambios: ${skipped}`);
    console.log(`   📝 Total: ${faqs.length}`);
    console.log('\n✅ Seed de FAQs completado!');

    return { created, updated, skipped, total: faqs.length };
  } catch (error) {
    console.error('❌ Error al ejecutar seed de FAQs:', error);
    throw error;
  }
}

