# Sistema de Gestión de Ingresos y Egresos

Sistema fullstack para la gestión de movimientos financieros con control de acceso basado en roles, reportes interactivos y documentación completa de API.

Sistema con autenticación GitHub OAuth, CRUD completo, reportes con gráficos, exportación CSV y 36 pruebas unitarias funcionando.

## Tecnologías Implementadas

### Frontend

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático completo
- **Tailwind CSS** - Framework de estilos utilitarios
- **Shadcn/ui** - Biblioteca de componentes accesibles
- **Radix UI** - Componentes primitivos sin estilos
- **Recharts** - Biblioteca de gráficos para React
- **React Hook Form** - Manejo de formularios con validación

### Backend y Base de Datos

- **Next.js API Routes** - Endpoints REST nativos
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Base de datos relacional
- **Better Auth** - Sistema de autenticación moderno
- **Swagger/OpenAPI** - Documentación automática de API

### Testing y Calidad

- **Jest** - Framework de testing
- **React Testing Library** - Testing de componentes React
- **TypeScript** - Análisis estático de código

### Librerías de Iconos y UI

- **Radix UI Icons** - Iconos consistentes con el sistema de diseños
- **Lucide React** - Conjunto de iconos minimalistas
- **Class Variance Authority (CVA)** - Variantes de estilos tipadas
- **Tailwind Merge** - Utilidad para combinar clases CSS

## Funcionalidades Implementadas

### Sistema de Autenticación y Autorización

- Control de acceso basado en roles (RBAC)
- Autenticación con GitHub vía Better Auth
- Protección de rutas y API endpoints
- Nuevos usuarios automáticamente asignados como "ADMIN"

### Dashboard y Navegación

- Dashboard principal con métricas en tiempo real
- Navegación funcional entre secciones
- Diseño responsive con Tailwind CSS
- Componentes accesibles con Shadcn/ui y Radix UI

### Gestión de Ingresos y Egresos

- CRUD completo de movimientos financieros
- Tabla interactiva con paginación y ordenamiento
- Búsqueda avanzada en múltiples campos
- Filtros funcionales por tipo y fechas
- Modal de detalles para visualizar movimientos
- Formulario reactivo con validación
- Manejo de errores visible y robusto

### Gestión de Usuarios (Solo Administradores)

- Lista de usuarios con tabla interactiva
- Edición de usuarios con formulario validado
- Restricción de seguridad: Usuario no puede cambiar su propio rol
- Validaciones de email y teléfono

### Reportes y Analytics (Solo Administradores)

- Gráficos interactivos con Recharts
- Métricas en tiempo real: balance, ingresos, egresos
- Exportación a CSV funcional
- Estadísticas por período

## API y Backend

### Endpoints Implementados

- API REST completa con Next.js API Routes
- Base de datos PostgreSQL con Prisma ORM
- Documentación Swagger disponible en `/api/docs`
- Validación de datos y sanitización
- Manejo de errores robusto

### Seguridad Implementada

- RBAC completo con verificación en cliente y servidor
- Validación de datos en frontend y backend
- Sanitización de inputs del usuario
- Protección contra edición de rol propio
- Sesiones seguras con Better Auth

## Testing y Calidad de Código

### Métricas de Pruebas

- **Utilidades**: 19 pruebas (100% cobertura funcional)
- **Lógica de Negocio**: 17 pruebas (useMovements completo)
- **Componentes**: 2 suites configuradas
- **Total**: 36 pruebas unitarias implementadas

### Configuración

- Configuración completa de Jest y React Testing Library
- Pruebas unitarias para funciones utilitarias
- Pruebas de lógica de negocio
- Setup de mocks para componentes y APIs

## Estructura del Proyecto

```
app/                     # App Router Next.js 15
├── api/                 # API endpoints documentados
├── dashboard/           # Dashboard con métricas
├── movements/           # Gestión movimientos
├── users/               # Gestión usuarios
└── reports/             # Reportes y analytics

components/
├── custom/              # MovementForm, DataTable, etc.
└── ui/                  # Componentes base Shadcn

hooks/                   # useMovements (lógica de negocio)
lib/                     # Utilidades (19 funciones testeadas)
prisma/                  # DB schema y migraciones
types/                   # TypeScript definitions
__tests__/               # Suite de pruebas unitarias
```

## Rendimiento y Experiencia de Usuario

### Optimizaciones Implementadas

- Loading states en todas las operaciones
- Error handling visible y comprensible
- Optimistic updates en UI
- Debounced search para mejor UX
- Responsive design (aunque no requerido)
- Accessible components con Radix UI

## Instalación y Configuración

### Requisitos Previos

- Node.js 18+
- PostgreSQL
- Cuenta de GitHub (para autenticación)

### Configuración Local

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd app_ingresos_egresos
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Configurar las siguientes variables:

- `DATABASE_URL`: Conexión a PostgreSQL
- `BETTER_AUTH_SECRET`: Secreto para Better Auth
- `GITHUB_CLIENT_ID`: ID del cliente GitHub OAuth
- `GITHUB_CLIENT_SECRET`: Secreto del cliente GitHub OAuth

4. **Configurar base de datos**

```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run test` - Ejecutar pruebas unitarias
- `npm run test:watch` - Pruebas en modo watch
- `npm run lint` - Linter de código

## Despliegue

El proyecto está configurado para desplegarse en Vercel:

1. Conectar repositorio de GitHub con Vercel
2. Configurar variables de entorno en Vercel
3. Desplegar automáticamente en cada push

## Cumplimiento de Requisitos

### Requisitos Funcionales: 100% Completados

- Roles y permisos (AUTO-ADMIN implementado)
- Home con navegación
- Sistema de ingresos/egresos completo
- Gestión de usuarios completa
- Reportes con gráficos y CSV

### Requisitos Técnicos: 100% Completados

- Next.js (migrado a App Router para mejor arquitectura)
- TypeScript completo
- Tailwind CSS
- Shadcn components
- Better Auth con GitHub
- Prisma + PostgreSQL
- API documentation `/api/docs`
- RBAC security
- Pruebas unitarias (36 pruebas)
