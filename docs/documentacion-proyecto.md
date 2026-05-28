# Smart Life Organizer

**Desarrollo e implementación de una aplicación web dinámica utilizando tecnologías modernas del lado del servidor**

---

## Portada

| | |
|---|---|
| **Nombre del proyecto** | Smart Life Organizer |
| **Asignatura** | Desarrollo de Aplicaciones Web |
| **Objetivo** | Diseñar, desarrollar y publicar una aplicación web funcional aplicando los temas de la asignatura |
| **Tecnologías principales** | React 19, Node.js, Express, TypeScript, Prisma, SQLite |
| **Fecha** | Mayo 2026 |

---

## Introducción

En la actualidad, la gestión del tiempo se ha convertido en un desafío constante para estudiantes y profesionales. La multiplicidad de actividades académicas, laborales, hábitos personales y compromisos sociales hace necesario contar con herramientas que permitan organizar de manera eficiente el día a día.

**Smart Life Organizer** surge como una solución web integral que permite a los usuarios planificar sus actividades, establecer horarios fijos, dar seguimiento a hábitos, visualizar estadísticas de productividad y recibir sugerencias inteligentes para optimizar su tiempo. El sistema incorpora un panel de administración para la gestión de usuarios y una integración con API externa de clima para facilitar la planificación.

El proyecto fue desarrollado aplicando los temas vistos en la asignatura: framework del lado del servidor, servicios web REST, peticiones asíncronas AJAX, seguridad web y publicación del sistema.

---

## Objetivos

### Objetivo General
Diseñar, desarrollar y publicar una aplicación web funcional que resuelva una necesidad real de organización personal, integrando marcos de trabajo del lado del servidor, servicios web, peticiones asíncronas mediante AJAX, medidas de seguridad web y publicación del sistema en un entorno accesible.

### Objetivos Específicos
1. Implementar un framework backend estructurado con separación de responsabilidades (rutas, controladores, servicios, middleware).
2. Desarrollar una API REST completa con operaciones CRUD y autenticación segura mediante JWT.
3. Implementar comunicación asíncrona entre cliente y servidor utilizando Axios para una experiencia de usuario fluida.
4. Aplicar medidas de seguridad web: cifrado de contraseñas, validación de datos, protección contra inyección SQL y control de acceso por roles.
5. Consumir un servicio web externo (API de clima) para enriquecer la funcionalidad del sistema.
6. Publicar el sistema en un entorno accesible con base de datos operativa.
7. Implementar un panel de administración con roles y registro de actividades.

---

## Descripción del Sistema

Smart Life Organizer es una aplicación web de organización personal que permite a los usuarios gestionar su tiempo de manera inteligente. El sistema está compuesto por dos grandes componentes:

### Módulo de Usuario

| Funcionalidad | Descripción |
|---------------|-------------|
| **Autenticación** | Registro e inicio de sesión seguro con JWT + refresh tokens |
| **Dashboard** | Vista general con agenda del día, sugerencias inteligentes, progreso de hábitos y clima actual |
| **Actividades** | CRUD completo con filtros, búsqueda, paginación y ordenamiento |
| **Calendario** | Vista interactiva por mes/semana/día con horarios fijos y actividades |
| **Horarios Fijos** | Creación individual y por lotes de horarios recurrentes |
| **Hábitos** | Seguimiento diario con rachas, progreso y edición en línea |
| **Transporte** | CRUD de rutas con origen, destino, duración y día opcional |
| **Estadísticas** | Visualización de productividad por categorías, prioridades y hábitos |
| **Perfil** | Edición de datos personales y cambio de contraseña |
| **Exportación** | Exportación e importación de datos en formatos JSON y XML |

### Módulo de Administración

| Funcionalidad | Descripción |
|---------------|-------------|
| **Dashboard Admin** | Estadísticas globales de la plataforma con acceso rápido |
| **Gestión de Usuarios** | CRUD completo con creación, edición, detalle y eliminación |
| **Detalle de Usuario** | Visualización de actividades, hábitos y horarios de un usuario específico |
| **Registro de Actividad** | Auditoría de acciones realizadas por administradores |
| **Ajustes del Sistema** | Exportación global de datos e información del sistema |

### API Externa
El sistema consume el servicio web [wttr.in](https://wttr.in) para mostrar información meteorológica actual, pronóstico por hora (intervalos de 3 horas) y pronóstico a 3 días en el dashboard del usuario.

---

## Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | >= 18 | Entorno de ejecución |
| Express | 4.21 | Framework web del lado del servidor |
| TypeScript | 5.5 | Tipado estático |
| Prisma | 5.22 | ORM para base de datos |
| SQLite | - | Base de datos relacional |
| JWT (jsonwebtoken) | 9.0 | Autenticación basada en tokens |
| bcryptjs | 2.4 | Cifrado de contraseñas |
| Zod | 3.23 | Validación de esquemas de datos |
| Helmet | 7.1 | Seguridad HTTP |
| express-rate-limit | 8.5 | Limitación de peticiones |
| tsx | 4.19 | Ejecución TypeScript en desarrollo |
| Vitest | 4.1 | Pruebas unitarias |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2 | Framework de interfaz de usuario |
| TypeScript | 6.0 | Tipado estático |
| Vite | 8.0 | Empaquetador y servidor de desarrollo |
| Tailwind CSS | 4.3 | Framework de estilos utilitario |
| Framer Motion | 12.39 | Animaciones |
| Zustand | 5.0 | Manejo de estado global |
| Axios | 1.16 | Peticiones HTTP asíncronas |
| React Router | 7.15 | Enrutamiento |
| React Hook Form | 7.76 | Manejo de formularios |
| React Toastify | 11.1 | Notificaciones |
| FullCalendar | 6.1 | Calendario interactivo |
| Recharts | 3.8 | Gráficas estadísticas |

---

## Diagramas y Estructura

### Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                     Cliente (Navegador)                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              React + Vite + Tailwind                 │ │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌────────────────┐ │ │
│  │  │ Pages │ │Components│ │ Store │ │ Services (Axios)│ │ │
│  │  └───────┘ └───────┘ └───────┘ └────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON) - AJAX
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Servidor (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API REST (Router principal)              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │ │
│  │  │ Middleware│ │Controllers│ │ Services │ │ Routes │ │ │
│  │  │(auth,JWT) │ │          │ │          │ │        │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Prisma ORM + SQLite                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                         │                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Externa (wttr.in)                    │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Estructura del Proyecto

```
smart-life-organizer/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos
│   │   ├── migrations/             # Migraciones SQL
│   │   └── seed.ts                 # Datos iniciales
│   ├── src/
│   │   ├── config/                 # Configuración (JWT, puerto, etc.)
│   │   ├── controllers/            # Controladores por recurso
│   │   ├── middleware/             # auth, admin middleware
│   │   ├── routes/                 # Definición de rutas
│   │   ├── services/               # Lógica de negocio
│   │   ├── utils/                  # Validadores, Prisma client
│   │   └── server.ts               # Punto de entrada
│   ├── tests/                      # Pruebas unitarias
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── auth/               # ProtectedRoute, AdminRoute
│   │   │   ├── forms/              # Formularios (ActivityForm, etc.)
│   │   │   ├── layouts/            # MainLayout, Sidebar, Navbar
│   │   │   └── ui/                 # Modal, Pagination, Skeleton, ErrorBoundary
│   │   ├── pages/                  # Páginas de la aplicación
│   │   │   ├── Admin/              # Panel de administración
│   │   │   ├── Activities/         # CRUD de actividades
│   │   │   ├── Calendar/           # Calendario interactivo
│   │   │   ├── Dashboard/          # Dashboard principal
│   │   │   ├── Habits/             # Seguimiento de hábitos
│   │   │   ├── Login/              # Autenticación
│   │   │   ├── NotFound/           # Página 404
│   │   │   ├── Profile/            # Perfil de usuario
│   │   │   └── Statistics/         # Estadísticas
│   │   ├── services/               # Servicios API (Axios)
│   │   ├── store/                  # Estado global (Zustand)
│   │   ├── types/                  # Interfaces TypeScript
│   │   └── utils/                  # Funciones auxiliares
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── database/
│   └── smartlife-schema.sql        # Esquema SQL completo
├── docs/
│   ├── admin-panel.md              # Documentación del panel admin
│   └── publicacion.md              # Guía de publicación
├── README.md
└── SUMMARY.md
```

### Modelo de Datos (Entidad-Relación)

```
┌─────────────────┐       ┌──────────────────┐
│      User       │       │    Category      │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ name            │       │ name             │
│ email (UNIQUE)  │       │ icon             │
│ password (hash) │       │ color            │
│ role (USER/ADMIN)│      └──────────────────┘
│ profileImage    │              │
│ refreshToken    │              │
│ createdAt       │              │
│ updatedAt       │              │
└────────┬────────┘              │
         │                       │
         │ 1                    N │
         │ ──────────────────────│
         │                       │
         │ 1                    N│
    ┌────┴──────────┐    ┌──────┴──────────┐
    │ FixedSchedule │    │   Activity       │
    ├───────────────┤    ├─────────────────┤
    │ id (PK)       │    │ id (PK)         │
    │ userId (FK)   │    │ userId (FK)     │
    │ title         │    │ categoryId (FK) │
    │ day           │    │ title           │
    │ startTime     │    │ description     │
    │ endTime       │    │ duration        │
    │ type          │    │ priority        │
    └───────────────┘    │ deadline        │
                         │ startTime       │
    ┌──────────────┐     │ splittable      │
    │    Habit     │     │ status          │
    ├──────────────┤     │ createdAt       │
    │ id (PK)      │     └─────────────────┘
    │ userId (FK)  │
    │ title        │     ┌──────────────────┐
    │ streak       │     │   Transport      │
    │ target       │     ├──────────────────┤
    │ completed    │     │ id (PK)          │
    │ lastCompleted│     │ userId (FK)      │
    │ createdAt    │     │ origin           │
    └──────────────┘     │ destination      │
                            │ duration         │
                            │ day              │
    ┌─────────────────┐  └──────────────────┘
    │   Suggestion    │
    ├─────────────────┤  ┌──────────────────┐
    │ id (PK)         │  │   AdminLog       │
    │ userId (FK)     │  ├──────────────────┤
    │ suggestion      │  │ id (PK)          │
    │ type            │  │ adminId          │
    │ read            │  │ action           │
    │ generatedAt     │  │ target           │
    └─────────────────┘  │ targetId         │
                         │ details          │
                         │ createdAt        │
                         └──────────────────┘
```

### Diagrama de Flujo de Autenticación

```
Usuario                      Frontend                    Backend                  BD
   │                            │                          │                      │
   │── Login/Register ──────────│                          │                      │
   │                            │── POST /auth/login ──────│                      │
   │                            │                          │── Verificar credencial│
   │                            │                          │── Generar JWT + RT    │
   │                            │◄──── { token, user } ────│                      │
   │◄── Redirigir a Dashboard ──│                          │                      │
   │                            │                          │                      │
   │── Navegar a /activities ───│                          │                      │
   │                            │── GET /activities ───────│                      │
   │                            │   (Authorization: Bearer │── Verificar JWT      │
   │                            │    <token>)              │── userId de token    │
   │                            │◄──── Actividades ────────│── Consultar BD       │
   │◄── Renderizar tabla ──────│                          │                      │
```

---

## Capturas de Funcionamiento

*(Las siguientes capturas describen las pantallas principales del sistema)*

### Pantalla de Login
Formulario de inicio de sesión con validación en tiempo real. Incluye enlace para registro de nuevos usuarios. Utiliza Axios para enviar credenciales de forma asíncrona y almacena el token JWT en localStorage.

### Dashboard Principal
Vista general del usuario con:
- Tarjetas de resumen (actividades pendientes, completadas, tiempo libre descontando transporte, racha de hábitos)
- Barra de progreso general
- Agenda diaria con horarios fijos y actividades pendientes
- Widget de clima con datos actuales, pronóstico por hora y pronóstico a 3 días (API externa)
- Sugerencias inteligentes generadas por el motor de scheduling
- Seguimiento rápido de hábitos del día

### Gestión de Actividades
Tabla con filtros por estado (todas/pendientes/completadas), búsqueda en tiempo real con debounce, ordenamiento por columna y paginación. Modal para crear/editar actividades con validación de formularios. Las acciones (crear, actualizar, eliminar) se realizan mediante peticiones AJAX sin recargar la página.

### Gestión de Transporte
CRUD completo de rutas de transporte con origen, destino, duración y día opcional. El motor de scheduling descuenta automáticamente los minutos de transporte del tiempo libre disponible en cada día, mostrando el tiempo real disponible en el dashboard.

### Calendario Interactivo
Vista de calendario con FullCalendar que muestra horarios fijos como bloques de tiempo y actividades pendientes. Soporta vistas por mes, semana y día. Los cambios de vista y navegación son completamente asíncronos.

### Panel de Administración
Accesible solo para usuarios con rol ADMIN. Incluye:
- Dashboard con estadísticas globales (usuarios, actividades, hábitos, horarios, logs)
- CRUD completo de usuarios con modal para crear/editar
- Detalle de usuario con actividades, hábitos y horarios
- Registro de actividad con auditoría de acciones administrativas
- Exportación global de datos de la plataforma

---

## Implementación de Temáticas Obligatorias

### 3.1 Marcos de Trabajo del Lado del Servidor (Express)

El backend está organizado siguiendo una arquitectura modular con separación clara de responsabilidades:

- **Rutas** (`routes/`): Definición de endpoints HTTP
- **Controladores** (`controllers/`): Manejo de peticiones y respuestas
- **Servicios** (`services/`): Lógica de negocio
- **Middleware** (`middleware/`): Autenticación, autorización
- **Configuración** (`config/`): Variables de entorno

### 3.2 Servicios Web (API REST + JSON)

Se implementó una API REST completa con los siguientes endpoints:

| Grupo | Endpoints |
|-------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/change-password`, `GET|PUT /auth/profile` |
| Activities | `GET|POST /activities`, `GET|PUT|DELETE /activities/:id` |
| Habits | `GET|POST /habits`, `PUT|DELETE /habits/:id`, `POST /habits/:id/toggle` |
| Schedule | `GET|POST /schedule`, `PUT|DELETE /schedule/:id`, `POST /schedule/batch` |
| Statistics | `GET /statistics` |
| Transport | `GET|POST /transport`, `GET|PUT|DELETE /transport/:id` |
| Admin | `GET|POST /admin/users`, `PUT|DELETE /admin/users/:id`, `GET /admin/users/:id/detail`, `GET /admin/stats`, `GET /admin/logs`, `GET /admin/export` |
| Weather | `GET /weather?city=...` (API externa con datos actuales, por hora y pronóstico) |
| Scheduling | `GET /scheduling/analyze`, `GET /scheduling/suggestions` |

Todos los endpoints intercambian datos en formato JSON.

### 3.3 AJAX y Peticiones Asíncronas

Se utilizó Axios para toda la comunicación cliente-servidor:

- **Inicio de sesión**: Envío asíncrono de credenciales sin recargar la página
- **CRUD de actividades**: Crear, editar, eliminar y listar mediante peticiones AJAX
- **Búsqueda dinámica**: Filtrado en tiempo real con debounce (300ms)
- **Tablas dinámicas**: Paginación y ordenamiento sin recargar
- **Actualización parcial**: Toasts de confirmación sin recargar la página
- **Interceptor de tokens**: Refresco automático de JWT al expirar

### 3.4 Seguridad Web

| Medida | Implementación |
|--------|----------------|
| **Validación de formularios** | Zod schemas en backend + validación HTML5 en frontend |
| **Protección SQL Injection** | Prisma ORM con consultas parametrizadas |
| **Manejo seguro de sesiones** | JWT con expiración + refresh tokens rotativos |
| **Contraseñas cifradas** | bcrypt con 12 rondas de sal |
| **Control de acceso por roles** | Middleware `authMiddleware` + `adminMiddleware` |
| **Rate limiting** | express-rate-limit (60 req/min general, 10 req/min registro) |
| **Headers de seguridad** | Helmet middleware |
| **Protección CORS** | Configuración de orígenes permitidos |

### 3.5 Publicación

El sistema está preparado para publicación en:
- **Local**: Servidor en red local
- **Railway.app** (recomendado): Hosting gratuito con Node.js
- **Vercel + Render**: Frontend en Vercel, backend en Render

Ver `docs/publicacion.md` para instrucciones detalladas.

---

## Pruebas Realizadas

### Backend (28 pruebas)
- Servicio de autenticación (registro, login, refresh, logout)
- Servicio de actividades (CRUD)
- Servicio de hábitos (CRUD, toggle)
- Servicio de horarios (CRUD, batch)
- Servicio de scheduling (análisis de tiempo libre descontando transporte por día)
- Servicio de transporte
- Pruebas de integración con base de datos

### Frontend (8 pruebas)
- Renderizado de componentes
- Estados de carga y error
- Navegación y enrutamiento

Para ejecutar:
```bash
cd backend && npm test
cd frontend && npm test
```

---

## Conclusiones

El desarrollo de Smart Life Organizer permitió aplicar de manera integral los conocimientos adquiridos en la asignatura, demostrando la viabilidad de construir una aplicación web completa utilizando tecnologías modernas.

**Logros principales:**
1. Se implementó una arquitectura backend robusta con Express y TypeScript, siguiendo el patrón MVC con separación clara de responsabilidades.
2. Se desarrolló una API REST completa con 30+ endpoints funcionales que permiten operaciones CRUD, autenticación segura y consumo de servicios externos.
3. Se logró una experiencia de usuario fluida mediante comunicación asíncrona con Axios, sin recargas innecesarias de página.
4. Se aplicaron medidas de seguridad web en múltiples capas: cifrado, validación, protección contra inyección SQL, control de acceso y limitación de peticiones.
5. Se integró exitosamente una API externa de clima (wttr.in) que enriquece la funcionalidad del sistema.
6. Se implementó un sistema de roles (USER/ADMIN) con panel de administración completo y registro de auditoría.
7. El sistema es responsivo y funcional en dispositivos móviles, con soporte para PWA.

**Áreas de mejora futura:**
- Integración con Google Calendar y otras plataformas de calendario
- Notificaciones push para recordatorios
- Versión móvil nativa con Capacitor
- Sincronización en tiempo real con WebSockets
- Despliegue en producción con Docker

El proyecto cumple con todos los requisitos establecidos y constituye una base sólida para futuras iteraciones y mejoras.
