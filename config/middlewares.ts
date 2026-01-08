export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',

  {
    name: 'strapi::cors',
    config: {
      interval: 60 * 1000, 
      max: env.int('RATE_LIMIT_MAX'),
      enabled: true,
      origin: env('CORS_ORIGINS', '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
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
