# Panel de Administración

El panel de administración permite gestionar usuarios y visualizar estadísticas globales de la plataforma.

## Acceso

1. Inicia sesión con una cuenta que tenga rol `ADMIN`
2. En el sidebar aparecerá la sección **Administración** con los siguientes enlaces:
   - **Panel Admin** — Dashboard con resumen global
   - **Usuarios** — CRUD completo de usuarios
   - **Actividad** — Registro de acciones de administradores
   - **Ajustes** — Exportación de datos e información del sistema

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard con estadísticas globales y acceso rápido |
| `/admin/users` | Lista de usuarios (crear, editar, ver detalle, eliminar) |
| `/admin/users/:id/detail` | Actividades, hábitos y horarios de un usuario específico |
| `/admin/logs` | Registro de acciones realizadas por administradores |
| `/admin/settings` | Exportación global de datos e información del sistema |

## API Endpoints

Todas las rutas requieren autenticación y rol `ADMIN`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/admin/stats` | Estadísticas globales (usuarios, actividades, hábitos, horarios, transportes, logs) |
| `GET` | `/api/v1/admin/users` | Lista de usuarios |
| `POST` | `/api/v1/admin/users` | Crear usuario (body: `name`, `email`, `password`, `role?`) |
| `PUT` | `/api/v1/admin/users/:id` | Actualizar usuario (body: `name?`, `email?`, `role?`, `password?`) |
| `DELETE` | `/api/v1/admin/users/:id` | Eliminar usuario |
| `GET` | `/api/v1/admin/users/:id/detail` | Actividades, hábitos y horarios de un usuario |
| `GET` | `/api/v1/admin/logs` | Registro de acciones de administradores |
| `GET` | `/api/v1/admin/export` | Exportar todos los datos de la plataforma en JSON |

## Usuario Admin por Defecto

- **Email:** `admin@example.com`
- **Contraseña:** `admin123`

También puedes promover un usuario existente a admin usando el endpoint `PUT /api/v1/admin/users/:id` con `{ "role": "ADMIN" }`.

## Consideraciones

- Los administradores **no pueden eliminarse entre sí** (botón de eliminar oculto para usuarios con rol ADMIN)
- Todas las acciones de admin (crear, editar, eliminar usuarios) quedan registradas en `AdminLog`
- La exportación incluye todos los datos de la plataforma en un solo archivo JSON
