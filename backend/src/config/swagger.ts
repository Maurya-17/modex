import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Modex Ticket Booking API',
      version: '1.0.0',
      description: 'API documentation for the Modex Ticket Booking System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Shows', description: 'Show management' },
      { name: 'Bookings', description: 'Booking operations' },
    ],
    components: {
      schemas: {
        Show: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            totalSeats: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Seat: {
          type: 'object',
          properties: {
            seatNumber: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['AVAILABLE', 'HELD', 'BOOKED'],
            },
          },
        },
        ShowSeats: {
          type: 'object',
          properties: {
            showId: { type: 'string', format: 'uuid' },
            showTitle: { type: 'string' },
            seats: {
              type: 'array',
              items: { $ref: '#/components/schemas/Seat' },
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            showId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            seats: {
              type: 'array',
              items: { type: 'integer' },
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'FAILED'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateShowRequest: {
          type: 'object',
          required: ['title', 'startTime', 'totalSeats'],
          properties: {
            title: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            totalSeats: { type: 'integer', minimum: 1 },
          },
        },
        CreateBookingRequest: {
          type: 'object',
          required: ['userId', 'seats'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            seats: {
              type: 'array',
              items: { type: 'integer' },
              minItems: 1,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            statusCode: { type: 'integer' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { swaggerSpec };

