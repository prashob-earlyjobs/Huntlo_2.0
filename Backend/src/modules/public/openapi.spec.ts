export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Huntlo API',
    version: '0.1.0',
    description:
      'Huntlo agentic AI recruiting platform API. Foundation endpoints only — feature modules coming in later phases.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current API version',
    },
  ],
  tags: [
    { name: 'Health', description: 'Liveness and readiness probes' },
    { name: 'Meta', description: 'API metadata' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        responses: {
          '200': {
            description: 'Service is alive',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe',
        description: 'Returns 503 when MongoDB is not connected.',
        responses: {
          '200': { description: 'Service is ready' },
          '503': { description: 'Service is not ready' },
        },
      },
    },
    '/version': {
      get: {
        tags: ['Meta'],
        summary: 'Application version',
        responses: {
          '200': { description: 'Version metadata' },
        },
      },
    },
  },
  components: {
    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string' },
            },
          },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    path: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          requestId: { type: 'string' },
        },
      },
    },
  },
} as const;
