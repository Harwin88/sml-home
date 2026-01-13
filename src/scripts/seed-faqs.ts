/**
 * Script para crear FAQs usando el API de Strapi 5
 */

const faqsData = [
  // GENERAL (7 FAQs)
  {
    question: '¿Qué es MSL Hogar?',
    answer: 'MSL Hogar es una plataforma digital que conecta familias colombianas con profesionales verificados para servicios del hogar. Facilitamos el encuentro entre usuarios que necesitan servicios de limpieza, plomería, electricidad, jardinería y más, con proveedores calificados y de confianza.',
    category: 'general',
    icon: 'help',
    order: 1,
    keywords: ['plataforma', 'servicios', 'hogar', 'conexión'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿En qué ciudades están disponibles?',
    answer: 'Actualmente operamos en las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira y Armenia. Estamos expandiéndonos continuamente a nuevas ciudades.',
    category: 'general',
    icon: 'location_on',
    order: 2,
    keywords: ['ciudades', 'cobertura', 'ubicación', 'colombia'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cuál es el horario de atención?',
    answer: 'Nuestra plataforma está disponible 24/7 para buscar y contactar profesionales. Nuestro equipo de soporte está disponible de lunes a viernes de 8:00 AM a 6:00 PM (hora de Colombia). Para emergencias fuera de horario, contamos con un sistema de respuesta automática.',
    category: 'general',
    icon: 'schedule',
    order: 3,
    keywords: ['horario', 'disponibilidad', 'soporte', '24/7'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cuánto cuesta usar la plataforma?',
    answer: 'Buscar y contactar profesionales es completamente gratis para los usuarios. Solo pagas directamente al profesional por el servicio contratado. No cobramos comisiones ocultas ni tarifas de intermediación.',
    category: 'general',
    icon: 'monetization_on',
    order: 4,
    keywords: ['costo', 'precio', 'gratis', 'tarifa'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Ofrecen garantía en los servicios?',
    answer: 'Los profesionales son responsables de la calidad de su trabajo. Muchos ofrecen garantías específicas según el tipo de servicio. Puedes consultar directamente con cada proveedor sobre sus políticas de garantía.',
    category: 'general',
    icon: 'workspace_premium',
    order: 5,
    keywords: ['garantía', 'calidad', 'seguro', 'protección'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo dejo una calificación?',
    answer: 'Después de completar un servicio, recibirás una notificación para calificar al profesional. Puedes calificar de 1-5 estrellas y dejar comentarios sobre tu experiencia.',
    category: 'general',
    icon: 'rate_review',
    order: 6,
    keywords: ['calificación', 'reseña', 'evaluación', 'estrellas'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Qué hago en caso de emergencia?',
    answer: 'Para emergencias del hogar, usa nuestro filtro de "Disponibilidad Inmediata" para encontrar profesionales que puedan atender rápidamente. Para emergencias de vida o muerte, llama al 123.',
    category: 'general',
    icon: 'emergency',
    order: 7,
    keywords: ['emergencia', 'urgente', 'inmediato', 'ayuda'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },

  // SEARCH (5 FAQs)
  {
    question: '¿Cómo busco un profesional?',
    answer: 'Usa nuestra barra de búsqueda en la página principal. Puedes buscar por tipo de servicio (ej: "plomero", "electricista") o por descripción del problema. Luego filtra por ubicación, precio, disponibilidad y calificaciones para encontrar el profesional ideal.',
    category: 'search',
    icon: 'search',
    order: 1,
    keywords: ['buscar', 'encontrar', 'profesional', 'servicio'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo funcionan los filtros de búsqueda?',
    answer: 'Puedes filtrar por: ubicación (ciudad o barrio), rango de precios, disponibilidad (inmediata, hoy, esta semana), calificación mínima (1-5 estrellas), tipo de servicio, experiencia del profesional y si ha sido verificado por MSL Hogar.',
    category: 'search',
    icon: 'filter_alt',
    order: 2,
    keywords: ['filtros', 'búsqueda', 'refinar', 'opciones'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Qué significan las calificaciones?',
    answer: 'Las calificaciones (1-5 estrellas) son opiniones reales de usuarios que han contratado los servicios. Solo usuarios que han completado un servicio pueden dejar una calificación. Verificamos que todas las reseñas sean auténticas.',
    category: 'search',
    icon: 'star',
    order: 3,
    keywords: ['calificaciones', 'estrellas', 'opiniones', 'reseñas'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Qué significa "Proveedor Verificado"?',
    answer: 'Los proveedores verificados han completado nuestro proceso de validación que incluye: verificación de identidad, antecedentes penales, certificaciones profesionales (cuando aplica), referencias comprobables y una entrevista con nuestro equipo.',
    category: 'search',
    icon: 'verified',
    order: 4,
    keywords: ['verificado', 'validado', 'certificado', 'confiable'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Puedo guardar mis profesionales favoritos?',
    answer: 'Sí, puedes hacer clic en el icono de corazón en el perfil de cualquier profesional para guardarlo en tus favoritos. Esto te permite acceder rápidamente a tus proveedores de confianza.',
    category: 'search',
    icon: 'favorite',
    order: 5,
    keywords: ['favoritos', 'guardar', 'preferidos', 'lista'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },

  // PAYMENTS (4 FAQs)
  {
    question: '¿Cómo pago por los servicios?',
    answer: 'El pago se realiza directamente al profesional según el método acordado entre ambas partes. Los métodos más comunes son: efectivo al finalizar el servicio, transferencia bancaria, Nequi, Daviplata o tarjeta. Cada profesional indica sus métodos de pago aceptados en su perfil.',
    category: 'payments',
    icon: 'payment',
    order: 1,
    keywords: ['pago', 'método', 'efectivo', 'tarjeta'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Puedo solicitar factura?',
    answer: 'Sí, puedes solicitar factura directamente al profesional. Los proveedores registrados como persona jurídica o régimen común están obligados a emitir factura electrónica. Verifica en el perfil del profesional si ofrece este servicio.',
    category: 'payments',
    icon: 'receipt',
    order: 2,
    keywords: ['factura', 'comprobante', 'documento', 'fiscal'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Hay costos adicionales o comisiones?',
    answer: 'No. El precio que ves en el perfil del profesional es el precio base del servicio. No cobramos comisiones adicionales. Ten en cuenta que algunos servicios pueden tener costos variables según materiales o complejidad del trabajo, lo cual debe acordarse previamente.',
    category: 'payments',
    icon: 'money_off',
    order: 3,
    keywords: ['comisiones', 'costos', 'adicionales', 'precio'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Puedo obtener cotizaciones antes de contratar?',
    answer: 'Sí, te recomendamos solicitar cotizaciones a 2-3 profesionales antes de decidir. La mayoría de los profesionales ofrecen presupuestos gratuitos. Esto te permite comparar precios y elegir la mejor opción.',
    category: 'payments',
    icon: 'request_quote',
    order: 4,
    keywords: ['cotización', 'presupuesto', 'estimación', 'precio'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },

  // SECURITY (4 FAQs)
  {
    question: '¿Cómo garantizan la seguridad?',
    answer: 'Implementamos múltiples medidas: verificación de antecedentes de todos los profesionales, sistema de calificaciones transparente, soporte 24/7, seguro de responsabilidad civil para incidentes, y un equipo dedicado que monitorea la calidad del servicio.',
    category: 'security',
    icon: 'shield',
    order: 1,
    keywords: ['seguridad', 'protección', 'garantía', 'confianza'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Qué pasa si tengo un problema con un servicio?',
    answer: 'Contacta inmediatamente a nuestro equipo de soporte. Investigaremos el caso, mediaremos entre ambas partes y, si corresponde, tomaremos acciones como advertencias, suspensión o eliminación del profesional de la plataforma. Tu satisfacción y seguridad son nuestra prioridad.',
    category: 'security',
    icon: 'policy',
    order: 2,
    keywords: ['problema', 'queja', 'reclamo', 'disputa'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo protegen mis datos personales?',
    answer: 'Cumplimos estrictamente con la Ley 1581 de 2012 de Protección de Datos de Colombia. Tu información personal está encriptada, solo se comparte lo mínimo necesario para contactar profesionales, y nunca vendemos tus datos a terceros. Lee nuestra Política de Privacidad para más detalles.',
    category: 'security',
    icon: 'privacy_tip',
    order: 3,
    keywords: ['privacidad', 'datos', 'personales', 'protección'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Tienen seguro de responsabilidad civil?',
    answer: 'MSL Hogar cuenta con seguro de responsabilidad civil que cubre incidentes durante la prestación del servicio. Adicionalmente, muchos profesionales tienen su propio seguro. Verifica en el perfil del profesional si cuenta con este seguro y qué cubre específicamente.',
    category: 'security',
    icon: 'security',
    order: 4,
    keywords: ['seguro', 'responsabilidad', 'cobertura', 'protección'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },

  // ACCOUNT (4 FAQs)
  {
    question: '¿Necesito crear una cuenta para usar MSL Hogar?',
    answer: 'No es obligatorio para buscar profesionales, pero crear una cuenta te permite: guardar tus búsquedas favoritas, contactar directamente a profesionales, ver tu historial de servicios, recibir notificaciones personalizadas y dejar calificaciones.',
    category: 'account',
    icon: 'person_add',
    order: 1,
    keywords: ['cuenta', 'registro', 'obligatorio', 'usuario'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo edito mi perfil?',
    answer: 'Inicia sesión, ve a "Mi Cuenta" en el menú superior, y selecciona "Editar Perfil". Puedes actualizar tu información personal, preferencias de contacto, dirección y métodos de pago preferidos.',
    category: 'account',
    icon: 'edit',
    order: 2,
    keywords: ['perfil', 'editar', 'actualizar', 'modificar'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo puedo trabajar como profesional en MSL Hogar?',
    answer: 'Si eres un profesional de servicios del hogar, haz clic en "Trabaja con Nosotros" en el menú principal. Completa el formulario de registro, proporciona tu documentación y certificaciones, y nuestro equipo revisará tu solicitud en 2-3 días hábiles.',
    category: 'account',
    icon: 'work',
    order: 3,
    keywords: ['trabajar', 'proveedor', 'profesional', 'registrar'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo recupero mi contraseña?',
    answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión. Ingresa tu email registrado y recibirás un enlace para restablecer tu contraseña. El enlace expira en 24 horas. Si no recibes el correo, verifica tu carpeta de spam.',
    category: 'account',
    icon: 'lock_reset',
    order: 4,
    keywords: ['contraseña', 'recuperar', 'olvidé', 'restablecer'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },

  // PROVIDERS (5 FAQs)
  {
    question: '¿Cómo contacto a un profesional?',
    answer: 'Haz clic en el perfil del profesional y encontrarás botones para llamar por teléfono, enviar WhatsApp o enviar un mensaje interno a través de la plataforma. Elige el método que prefieras.',
    category: 'providers',
    icon: 'contact_phone',
    order: 1,
    keywords: ['contactar', 'comunicar', 'mensaje', 'llamar'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Puedo cancelar un servicio agendado?',
    answer: 'Sí, puedes cancelar un servicio contactando directamente al profesional con al menos 24 horas de anticipación. Algunos profesionales pueden tener políticas específicas de cancelación, consúltalas antes de agendar.',
    category: 'providers',
    icon: 'event_busy',
    order: 2,
    keywords: ['cancelar', 'anular', 'servicio', 'cita'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Qué servicios están disponibles?',
    answer: 'Ofrecemos una amplia variedad: Limpieza, Plomería, Electricidad, Jardinería, Carpintería, Pintura, Aire acondicionado, Cerrajería, Fumigación, Mudanzas, Reparaciones generales, y más. Constantemente agregamos nuevas categorías.',
    category: 'providers',
    icon: 'home_repair_service',
    order: 3,
    keywords: ['servicios', 'categorías', 'tipos', 'disponibles'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Cómo sé si un profesional es confiable?',
    answer: 'Verifica estos indicadores: insignia de "Verificado", calificación promedio de 4+ estrellas, cantidad de servicios completados (más de 20 es excelente), reseñas detalladas de otros usuarios, y tiempo de respuesta promedio.',
    category: 'providers',
    icon: 'verified_user',
    order: 4,
    keywords: ['confiable', 'verificar', 'confiar', 'reputación'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Los profesionales llevan sus propias herramientas?',
    answer: 'La mayoría de los profesionales llevan sus herramientas básicas de trabajo. Para materiales específicos o grandes cantidades, generalmente se acuerda previamente quién los proveerá. Consulta este detalle al solicitar la cotización.',
    category: 'providers',
    icon: 'build',
    order: 5,
    keywords: ['herramientas', 'materiales', 'equipos', 'propios'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },

  // TECHNICAL (3 FAQs)
  {
    question: '¿Qué hago si la plataforma no carga correctamente?',
    answer: 'Intenta estos pasos: 1) Refresca la página (Ctrl+F5), 2) Limpia el caché del navegador, 3) Prueba en modo incógnito, 4) Usa otro navegador, 5) Verifica tu conexión a internet. Si el problema persiste, contáctanos en soporte@mslhogar.com.',
    category: 'technical',
    icon: 'build_circle',
    order: 1,
    keywords: ['problema', 'error', 'no carga', 'técnico'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Por qué no encuentro profesionales en mi zona?',
    answer: 'Puede deberse a: 1) Zona con poca cobertura aún, 2) Filtros muy restrictivos (intenta ampliar criterios), 3) Horario poco usual. Contáctanos para verificar la cobertura en tu área y te ayudaremos a encontrar profesionales cercanos.',
    category: 'technical',
    icon: 'location_off',
    order: 2,
    keywords: ['no encuentro', 'sin resultados', 'zona', 'área'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    question: '¿Puedo usar MSL Hogar desde mi celular?',
    answer: 'Sí, nuestra plataforma está completamente optimizada para funcionar en smartphones y tablets de cualquier sistema operativo. Próximamente lanzaremos aplicaciones nativas para iOS y Android con funcionalidades adicionales.',
    category: 'technical',
    icon: 'phone_android',
    order: 3,
    keywords: ['móvil', 'celular', 'smartphone', 'app'],
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0
  }
];

export default async function seedFaqs() {
  const strapi = (global as any).strapi;

  if (!strapi) {
    throw new Error('Strapi no está disponible. Ejecuta este script dentro del contexto de Strapi.');
  }

  console.log('🌱 Iniciando seed de FAQs...');
  console.log(`📝 Total de FAQs a crear: ${faqsData.length}`);

  let created = 0;
  let errors = 0;

  for (const faqData of faqsData) {
    try {
      // Usar documents API de Strapi 5
      const faq = await strapi.documents('api::faq.faq').create({
        data: {
          ...faqData,
          publishedAt: new Date() // Publicar automáticamente
        }
      });

      console.log(`✅ FAQ creada: "${faqData.question.substring(0, 50)}..."`);
      created++;
    } catch (error: any) {
      console.error(`❌ Error creando FAQ "${faqData.question}":`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ FAQs creadas: ${created}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📋 Total: ${faqsData.length}`);
  console.log('='.repeat(60));

  return { created, errors, total: faqsData.length };
}

