# Instrucciones de Ejecución — Smart Life Organizer

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

## 1. Clonar e instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## 2. Configurar variables de entorno

El archivo `backend/.env` ya incluye valores por defecto:

| Variable        | Valor por defecto                             |
|-----------------|-----------------------------------------------|
| `DATABASE_URL`  | `file:./dev.db`                               |
| `JWT_SECRET`    | `s10_8f3a2c9e1b7d4f6a...`                    |
| `JWT_EXPIRES_IN`| `7d`                                          |
| `PORT`          | `3001`                                        |
| `CORS_ORIGIN`   | `*`                                           |

## 3. Base de datos

Las migraciones ya están aplicadas y la base de datos SQLite (`backend/dev.db`) está lista.

Si necesitas regenerarla desde cero:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

## 4. Ejecutar

### Terminal 1 — Backend (http://localhost:3001)

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend (http://localhost:5178)

```bash
cd frontend
npm run dev
```

## 5. Credenciales de prueba

| Rol    | Email             | Contraseña |
|--------|-------------------|------------|
| Demo   | demo@example.com  | 123456     |
| Admin  | admin@example.com | admin123   |

## 6. Comandos útiles

```bash
# Backend
npm run build          # Compilar TypeScript
npm run test           # Ejecutar tests
npm run prisma:seed    # Reiniciar datos de prueba

# Frontend
npm run build          # Build para producción
npm run preview        # Vista previa del build
npm run lint           # Linter
npm run test           # Ejecutar tests
```

## 7. Estado actual de los servidores

- Backend: corriendo en `http://localhost:3001` ✅
- Frontend: corriendo en `http://localhost:5178` ✅

## 8. Cobertura por unidades

| Unidad | Tema | Estado |
|--------|------|:------:|
| 1 | Framework (React + Vite + Express + Prisma) | ✅ |
| 2 | XML (export/import con fast-xml-parser) | ✅ |
| 3 | AJAX (Axios con interceptors y refresh token) | ✅ |
| 4 | Servicios web síncronos y asíncronos (~40 endpoints REST) | ✅ |
| 5 | Hosting en servidor externo | ❌ No implementado |

**Hosting (Unidad 5):** El proyecto solo está corriendo en local. Hay guías de despliegue en `docs/publicacion.md` para Railway, Vercel + Render, pero **ninguna se ha ejecutado**. Consulta ese archivo si deseas publicarlo.
