export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Kreatix Technologies API',
    version: '1.0.0',
    description: 'API documentation for Kreatix Technologies — Software Development, Cybersecurity & Cloud Services',
    contact: {
      name: 'Kreatix Technologies',
      email: 'info@kreatixtech.com',
      url: 'https://kreatixtech.com',
    },
  },
  servers: [
    { url: 'https://kreatixtech.fly.dev', description: 'Production' },
    { url: 'http://localhost:5000', description: 'Development' },
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
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        security: [],
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  orgName: { type: 'string' },
                  subdomain: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created successfully' },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        security: [],
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        responses: {
          200: { description: 'User profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Request password reset email',
        security: [],
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                },
                required: ['email'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset password with token',
        security: [],
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
                required: ['token', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/assessments': {
      get: {
        summary: 'List assessments',
        tags: ['Assessments'],
        responses: {
          200: { description: 'List of assessments' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create a new assessment',
        tags: ['Assessments'],
        responses: {
          201: { description: 'Assessment created' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/assessments/{id}': {
      get: {
        summary: 'Get assessment by ID',
        tags: ['Assessments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Assessment details' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/service-requests': {
      get: {
        summary: 'List service requests',
        tags: ['Service Requests'],
        responses: {
          200: { description: 'List of service requests' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create a new service request',
        tags: ['Service Requests'],
        responses: {
          201: { description: 'Service request created' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/service-requests/{id}': {
      get: {
        summary: 'Get service request by ID',
        tags: ['Service Requests'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service request details' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/service-messages': {
      get: {
        summary: 'List service messages',
        tags: ['Messages'],
        parameters: [{ name: 'requestId', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of messages' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Send a message',
        tags: ['Messages'],
        responses: {
          201: { description: 'Message sent' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/notifications': {
      get: {
        summary: 'List notifications',
        tags: ['Notifications'],
        responses: {
          200: { description: 'List of notifications' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/contact': {
      post: {
        summary: 'Submit contact form',
        security: [],
        tags: ['Contact'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  message: { type: 'string' },
                },
                required: ['name', 'email', 'message'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Message sent' },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/api/blog': {
      get: {
        summary: 'List blog posts',
        security: [],
        tags: ['Blog'],
        responses: {
          200: { description: 'List of blog posts' },
        },
      },
    },
    '/api/blog/{slug}': {
      get: {
        summary: 'Get blog post by slug',
        security: [],
        tags: ['Blog'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Blog post' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/projects': {
      get: {
        summary: 'List portfolio projects',
        security: [],
        tags: ['Projects'],
        responses: {
          200: { description: 'List of projects' },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'Health check',
        security: [],
        tags: ['System'],
        responses: {
          200: { description: 'Server health status' },
        },
      },
    },
    '/api/analytics/track': {
      post: {
        summary: 'Track analytics event',
        security: [],
        tags: ['Analytics'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['PAGE_VIEW', 'CLICK'] },
                  page: { type: 'string' },
                  sessionId: { type: 'string' },
                  label: { type: 'string' },
                },
                required: ['type', 'sessionId'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Event tracked' },
        },
      },
    },
  },
};
