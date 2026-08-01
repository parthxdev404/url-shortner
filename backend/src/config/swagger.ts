import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'URL Shortener API',

      version: '1.0.0',

      description:
        'Production-ready URL Shortener built with Node.js, Express, TypeScript, MongoDB, Redis and BullMQ.',
    },

    servers: [
      {
        url: 'http://localhost:5000/api/v1',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ['./src/modules/**/*.ts', './src/docs/**/*.ts'],
});
