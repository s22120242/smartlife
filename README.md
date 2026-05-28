# Smart Life Organizer

Organizador inteligente de actividades, horarios, hábitos y transporte con clima y motor de scheduling.

## Documentación

- [Documentación completa del proyecto](docs/documentacion-proyecto.md) — portada, objetivos, diagramas, capturas, conclusiones
- [Panel de Administración](docs/admin-panel.md) — guía del módulo admin
- [Publicación](docs/publicacion.md) — instrucciones de despliegue

## Inicio rápido

```bash
# Terminal 1 — Backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev            # http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev            # http://localhost:5178
```

Demo: `demo@example.com` / `123456` · Admin: `admin@example.com` / `admin123`

## Estado

| Fase | Estado |
|------|--------|
| Backend + Frontend + Auth | ✅ |
| CRUD + Calendario | ✅ |
| Motor + Estadísticas | ✅ |
| Actividades en parrilla horaria | ✅ |
| Adaptación móvil | ✅ |
| Panel de Administración | ✅ |
| API externa de clima | ✅ |
| Transporte por día descontado | ✅ |
| Pronóstico por hora | ✅ |
| Documentación y publicación | ✅ |

## Tecnologías

- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, Framer Motion, Zustand, Axios, FullCalendar, Recharts
- **Backend:** Node.js, Express, TypeScript, Prisma, SQLite, JWT, bcrypt, Zod, Helmet
- **Testing:** Vitest

## Variables de entorno

`backend/.env` incluye valores por defecto: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `PORT=3001`.

## Versión móvil

La app se puede empaquetar con Capacitor para generar APK:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init SmartLife com.smartlife.app && npx cap add android
npm run build && npx cap sync && npx cap open android
```
