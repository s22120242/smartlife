# Unidades del proyecto — Ubicación en el código

## Unidad 1 — Framework

| Framework | Archivo(s) | Rol |
|-----------|-----------|-----|
| **React 19** | `frontend/src/` (todos los archivos .tsx) | UI basada en componentes, hooks, estado |
| **Express** | `backend/src/server.ts`, `backend/src/routes/` | Servidor HTTP, routing |
| **Vite** | `frontend/vite.config.ts`, `frontend/package.json` | Build tool, dev server, proxy |
| **Tailwind v4** | `frontend/src/index.css`, `frontend/vite.config.ts` | Estilos utility-first |
| **Prisma** | `backend/prisma/schema.prisma`, `backend/src/services/` | ORM, migraciones, seed |
| **Zustand** | `frontend/src/store/authStore.ts`, `sidebarStore.ts`, `themeStore.ts` | Estado global |

---

## Unidad 2 — XML

| Archivo | Descripción |
|---------|-------------|
| `backend/src/services/xmlService.ts` | Genera XML con `fast-xml-parser` y parsea XML de importación |
| `backend/src/routes/xmlRoutes.ts` | Endpoints `GET /api/v1/xml/export` y `POST /api/v1/xml/import` |
| `frontend/src/pages/Dashboard/DashboardPage.tsx:135-172` | Botones Exportar XML e Importar XML en UI |
| `backend/tests/xmlService.test.ts` | 5 tests de generación y parseo XML |
| `frontend/tests/xmlService.test.ts` | 3 tests de Blob/descarga XML |
| `docs/xml-implementacion.md` | Documentación completa |

---

## Unidad 3 — AJAX

| Archivo | Descripción |
|---------|-------------|
| `frontend/src/services/api.ts` | Cliente Axios con interceptors, refresh token, manejo de errores |
| `frontend/src/services/authService.ts` | Llamadas AJAX para auth (login, register, profile, refresh) |
| `frontend/src/services/activityService.ts` | CRUD actividades vía AJAX |
| `frontend/src/services/habitService.ts` | CRUD hábitos vía AJAX |
| `frontend/src/services/scheduleService.ts` | CRUD horarios vía AJAX |
| `frontend/src/services/categoryService.ts` | CRUD categorías vía AJAX |
| `frontend/src/services/statsService.ts` | Estadísticas vía AJAX |
| `frontend/src/pages/*.tsx` | Múltiples componentes con `fetch`/Axios para datos asíncronos |

---

## Unidad 4 — Servicios web síncronos y asíncronos

| Tipo | Endpoint | Archivo | Descripción |
|------|----------|---------|-------------|
| Síncrono | `GET/POST /auth/*` | `backend/src/routes/authRoutes.ts` | Registro, login, perfil |
| Síncrono | `GET/POST/PUT/DELETE /activities/*` | `backend/src/routes/activityRoutes.ts` | CRUD actividades |
| Síncrono | `GET/POST/PUT/DELETE /schedule/*` | `backend/src/routes/scheduleRoutes.ts` | CRUD horarios |
| Síncrono | `GET/POST/PUT/DELETE /habits/*` | `backend/src/routes/habitRoutes.ts` | CRUD hábitos |
| Síncrono | `GET/POST/DELETE /transport/*` | `backend/src/routes/transportRoutes.ts` | CRUD transportes |
| Síncrono | `GET /export` | `backend/src/routes/index.ts:30` | Exportar datos JSON |
| Síncrono | `GET /xml/export` | `backend/src/routes/xmlRoutes.ts:9` | Exportar datos XML |
| Asíncrono | `GET /scheduling/analyze` | `backend/src/routes/schedulingRoutes.ts` | Motor inteligente de scheduling |
| Asíncrono | `GET /scheduling/suggestions` | `backend/src/routes/schedulingRoutes.ts` | Sugerencias generadas |
| Asíncrono | `GET /statistics` | `backend/src/routes/statsRoutes.ts` | Estadísticas con filtro por período |
| Asíncrono | `POST /xml/import` | `backend/src/routes/xmlRoutes.ts:21` | Importar datos desde XML |

---

## Unidad 5 — Hosting

**Preparado para Render.** Pendiente de hacer push y conectar.

| Archivo | Descripción |
|---------|-------------|
| `render-build.sh` | Script de build que compila frontend y backend |
| `backend/src/server.ts` | Sirve frontend estático en producción (`app.use(express.static)`) |
| `backend/.env.example` | Variables de entorno de ejemplo (sin secretos reales) |
| `docs/instrucciones-ejecucion.md` | Pasos detallados para deploy en Render |
