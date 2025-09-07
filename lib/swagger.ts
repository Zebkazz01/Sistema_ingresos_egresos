import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Ingresos y Egresos',
      version: '1.0.0',
      description: `
        API REST para gestión de movimientos financieros con autenticación GitHub OAuth.
        
        ## Funcionalidades
        - Autenticación con GitHub (Better Auth)
        - Control de acceso RBAC (ADMIN/USER)
        - CRUD de movimientos financieros
        - Gestión de usuarios (solo admins)
        - Reportes y exportación CSV
        - Búsqueda y filtros avanzados
        
        ## Stack Tecnológico
        - Frontend: Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui
        - Backend: Next.js API Routes, Prisma ORM, PostgreSQL
        - Auth: Better Auth con GitHub OAuth
        - Testing: Jest + React Testing Library (36 pruebas)
        
        ## Autenticación
        Los nuevos usuarios se registran automáticamente como ADMIN.
        Para probar: primero autentícate en /auth/signin
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://tu-app.vercel.app',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
          description: 'Token de sesión Better Auth almacenado en cookie',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Token Bearer para autenticación programática',
        },
      },
      schemas: {
        // Esquemas de usuarios
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user-123',
            },
            name: {
              type: 'string',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@example.com',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
              example: 'ADMIN',
            },
            phone: {
              type: 'string',
              example: '+57 300 123 4567',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Esquemas de movimientos
        Movement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'mov_1704067200000',
            },
            concept: {
              type: 'string',
              example: 'Venta de producto',
            },
            amount: {
              type: 'number',
              format: 'float',
              example: 150.5,
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-01-15',
            },
            type: {
              type: 'string',
              enum: ['INCOME', 'EXPENSE'],
              example: 'INCOME',
            },
            userId: {
              type: 'string',
              example: 'user-123',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },

        // Esquemas de respuestas
        MovementsResponse: {
          type: 'object',
          properties: {
            movements: {
              type: 'array',
              items: { $ref: '#/components/schemas/Movement' },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 50 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                pages: { type: 'integer', example: 5 },
              },
            },
            summary: {
              type: 'object',
              properties: {
                totalAmount: { type: 'number', example: 1500.75 },
                totalMovements: { type: 'integer', example: 25 },
                income: { type: 'number', example: 1200.5 },
                expense: { type: 'number', example: 300.25 },
                balance: { type: 'number', example: 900.25 },
              },
            },
          },
        },

        // Esquemas de reportes
        FinancialReport: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalIncome: { type: 'number', example: 5000.0 },
                totalExpense: { type: 'number', example: 3000.0 },
                balance: { type: 'number', example: 2000.0 },
                totalMovements: { type: 'integer', example: 45 },
              },
            },
            chartData: {
              type: 'object',
              properties: {
                dailyChart: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', format: 'date' },
                      income: { type: 'number' },
                      expense: { type: 'number' },
                    },
                  },
                },
                monthlyChart: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'string' },
                      income: { type: 'number' },
                      expense: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },

        // Esquemas de errores
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Mensaje de error descriptivo',
            },
            hint: {
              type: 'string',
              example: 'Sugerencia para resolver el error',
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'No autorizado - Se requiere autenticación',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        AdminRequired: {
          description:
            'Acceso denegado - Se requieren permisos de administrador',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        BadRequest: {
          description: 'Solicitud inválida - Datos de entrada incorrectos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    paths: {
      '/auth/signin/': {
        get: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión con GitHub',
          description: 'Inicia el flujo OAuth con GitHub.',
          parameters: [
            {
              name: 'callbackURL',
              in: 'query',
              description:
                'URL de redirección después de la autenticación exitosa',
              schema: {
                type: 'string',
                example: '/dashboard',
              },
            },
          ],
          responses: {
            302: {
              description: 'Redirección a GitHub OAuth',
              headers: {
                Location: {
                  description: 'URL de GitHub OAuth',
                  schema: {
                    type: 'string',
                    example:
                      'https://github.com/login/oauth/authorize?client_id=...',
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/sign-out': {
        post: {
          tags: ['Autenticación'],
          summary: 'Cerrar sesión',
          description: 'Elimina cookies de sesión y cierra la sesión.',
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: 'Sesión cerrada exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Sesión cerrada exitosamente',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/session': {
        get: {
          tags: ['Autenticación'],
          summary: 'Obtener sesión',
          description: 'Obtiene datos de la sesión activa.',
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: 'Datos de sesión obtenidos exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      session: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          expiresAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'No hay sesión activa',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },

      '/api/movements/simple': {
        get: {
          tags: ['Movimientos'],
          summary: 'Listar movimientos',
          description: 'Lista paginada de movimientos con filtros opcionales.',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Número de página',
              schema: { type: 'integer', default: 1, minimum: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Cantidad de elementos por página',
              schema: {
                type: 'integer',
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Buscar por concepto',
              schema: { type: 'string' },
            },
            {
              name: 'type',
              in: 'query',
              description: 'Filtrar por tipo de movimiento',
              schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            },
            {
              name: 'startDate',
              in: 'query',
              description: 'Fecha de inicio (YYYY-MM-DD)',
              schema: { type: 'string', format: 'date' },
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'Fecha de fin (YYYY-MM-DD)',
              schema: { type: 'string', format: 'date' },
            },
          ],
          responses: {
            200: {
              description: 'Lista de movimientos obtenida exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MovementsResponse' },
                },
              },
            },
            401: {
              description: 'No autorizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Movimientos'],
          summary: 'Crear movimiento',
          description: 'Crea un nuevo movimiento financiero (solo ADMIN).',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['concept', 'amount', 'date', 'type'],
                  properties: {
                    concept: {
                      type: 'string',
                      example: 'Venta de producto',
                      minLength: 1,
                      maxLength: 255,
                    },
                    amount: {
                      type: 'number',
                      format: 'float',
                      example: 150.5,
                      minimum: 0.01,
                    },
                    date: {
                      type: 'string',
                      format: 'date',
                      example: '2024-01-15',
                    },
                    type: {
                      type: 'string',
                      enum: ['INCOME', 'EXPENSE'],
                      example: 'INCOME',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Movimiento creado exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Movimiento creado exitosamente',
                      },
                      movement: { $ref: '#/components/schemas/Movement' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Datos de entrada inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            401: {
              description: 'No autorizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            403: {
              description:
                'Acceso denegado - Se requieren permisos de administrador',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },

      '/api/users': {
        get: {
          tags: ['Usuarios'],
          summary: 'Listar usuarios',
          description: 'Lista todos los usuarios del sistema (solo ADMIN).',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Buscar por nombre o email',
              schema: { type: 'string' },
            },
            {
              name: 'role',
              in: 'query',
              description: 'Filtrar por rol',
              schema: { type: 'string', enum: ['ADMIN', 'USER'] },
            },
          ],
          responses: {
            200: {
              description: 'Lista de usuarios obtenida exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          pages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/AdminRequired' },
          },
        },
      },

      '/api/users/{id}': {
        put: {
          tags: ['Usuarios'],
          summary: 'Actualizar usuario',
          description: 'Actualiza información de un usuario (solo ADMIN).',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID del usuario',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Nuevo Nombre' },
                    role: {
                      type: 'string',
                      enum: ['ADMIN', 'USER'],
                      example: 'USER',
                    },
                    phone: { type: 'string', example: '+57 300 123 4567' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Usuario actualizado exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/AdminRequired' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      '/api/reports/financial': {
        get: {
          tags: ['Reportes'],
          summary: 'Reporte financiero',
          description: 'Datos para gráficos y análisis financiero (solo ADMIN).',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'period',
              in: 'query',
              description: 'Período de tiempo',
              schema: {
                type: 'string',
                enum: ['week', 'month', 'year', 'all'],
                default: 'all',
              },
            },
            {
              name: 'startDate',
              in: 'query',
              description: 'Fecha de inicio personalizada',
              schema: { type: 'string', format: 'date' },
            },
            {
              name: 'endDate',
              in: 'query',
              description: 'Fecha de fin personalizada',
              schema: { type: 'string', format: 'date' },
            },
          ],
          responses: {
            200: {
              description: 'Reporte financiero obtenido exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/FinancialReport' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/AdminRequired' },
          },
        },
      },

      '/api/reports/csv': {
        get: {
          tags: ['Reportes'],
          summary: 'Descargar CSV',
          description: 'Descarga reporte en formato CSV (solo ADMIN).',
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: 'type',
              in: 'query',
              description: 'Tipo de reporte',
              schema: {
                type: 'string',
                enum: ['movements', 'summary', 'users'],
                default: 'movements',
              },
            },
            {
              name: 'period',
              in: 'query',
              description: 'Período de tiempo',
              schema: { type: 'string', enum: ['week', 'month', 'year'] },
            },
            {
              name: 'startDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
            },
            {
              name: 'endDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
            },
          ],
          responses: {
            200: {
              description: 'Archivo CSV generado exitosamente',
              content: {
                'text/csv': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
              headers: {
                'Content-Disposition': {
                  description: 'Nombre del archivo CSV',
                  schema: {
                    type: 'string',
                    example:
                      'attachment; filename="movimientos_2024-01-15.csv"',
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/AdminRequired' },
          },
        },
      },

      '/api/health': {
        get: {
          tags: ['Sistema'],
          summary: 'Estado del sistema',
          description: 'Verifica el estado de salud del sistema y base de datos.',
          responses: {
            200: {
              description: 'Estado del sistema',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      timestamp: { type: 'string', format: 'date-time' },
                      version: { type: 'string', example: '1.0.0' },
                      database: {
                        type: 'object',
                        properties: {
                          status: { type: 'string', example: 'connected' },
                          provider: { type: 'string', example: 'postgresql' },
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
    },
  },
  apis: [], // No necesitamos archivos adicionales ya que toda la spec está aquí
};

const specs = swaggerJsdoc(options);

export default specs;
