export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',

  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: env('CORS_ORIGINS', '*')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
        .length > 0 
          ? env('CORS_ORIGINS', '*').split(',').map(o => o.trim()).filter(Boolean)
          : ['http://localhost:4200', 'http://localhost:4201', 'http://127.0.0.1:4200'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeadersOnError: true,
    },
  },

  'strapi::poweredBy',
  'strapi::query',

  {
    name: 'strapi::body',
    config: {
      formLimit: '256mb',
      jsonLimit: '256mb',
      textLimit: '256mb',
      formidable: {
        maxFileSize: 256 * 1024 * 1024,
      },
    },
  },

  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
