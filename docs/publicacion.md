# Guía de Publicación

## Opción 1: Publicación Local (Servidor en red local)

### Requisitos
- Node.js >= 18
- npm

### Pasos

```bash
# 1. Clonar o copiar el proyecto
cd smart-life-organizer

# 2. Configurar backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run build
npm start
# El backend corre en http://localhost:3001

# 3. Configurar frontend (otra terminal)
cd frontend
npm install
npm run build
npm run preview
# El frontend corre en http://localhost:5178
```

### Acceder desde otros dispositivos en la misma red
1. Obtén la IP local: `ipconfig` (Windows) o `ifconfig` (Linux/Mac)
2. En el frontend, edita `vite.config.ts` para agregar `--host 0.0.0.0`
3. Accede desde `http://<TU_IP>:5178`

---

## Opción 2: Publicación en Railway (recomendado - gratuito)

Railway tiene un tier gratuito que soporta Node.js y SQLite.

### Requisitos
- Cuenta en [Railway.app](https://railway.app) (GitHub login)
- El proyecto en un repositorio de GitHub

### Pasos

#### Backend
1. Sube el proyecto a GitHub
2. En Railway, crea un "New Project" → "Deploy from GitHub repo"
3. Selecciona el repositorio
4. Railway detecta automáticamente `package.json` en `backend/`
5. Configura el **Start Command**: `npm start`
6. Agrega variables de entorno en Railway:
   ```
   JWT_SECRET=<genera una clave secreta>
   JWT_EXPIRES_IN=7d
   PORT=3001
   CORS_ORIGIN=<URL del frontend>
   ```
7. Railway asignará una URL tipo `https://smartlife-backend.up.railway.app`

#### Frontend
1. En Railway, crea otro proyecto (o usa el mismo con múltiples servicios)
2. Configura el root directory como `frontend/`
3. Build Command: `npm run build`
4. Start Command: `npm run preview`
5. Variable de entorno: ninguna adicional

#### Conectar Frontend con Backend
En `frontend/vite.config.ts`, asegúrate que el proxy apunte al backend de Railway:

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://smartlife-backend.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
```

---

## Opción 3: Publicación en Vercel (Frontend) + Render (Backend)

### Frontend en Vercel
1. Conecta tu repo de GitHub a [Vercel](https://vercel.com)
2. Configura:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Vercel asigna una URL tipo `https://smartlife.vercel.app`

### Backend en Render
1. Crea cuenta en [Render](https://render.com)
2. "New Web Service" → conecta tu GitHub
3. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Agrega variables de entorno:
   ```
   JWT_SECRET=<clave_secreta>
   JWT_EXPIRES_IN=7d
   PORT=3001
   CORS_ORIGIN=https://smartlife.vercel.app
   ```
5. Render asigna URL tipo `https://smartlife-backend.onrender.com`

---

## Configuración de Base de Datos

Por defecto el proyecto usa SQLite (`dev.db`). En producción:

### SQLite (recomendado para Railway/Render)
- No requiere configuración extra
- Los datos persisten mientras el servicio no se reinicie
- En Railway, los datos se mantienen en el disco efímero

### Migrar a PostgreSQL (opcional)
Si necesitas persistencia permanente, puedes migrar a PostgreSQL:

1. Instala el driver: `npm install @prisma/client pg`
2. Actualiza `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Agrega `DATABASE_URL` en las variables de entorno del hosting
4. Ejecuta: `npx prisma migrate dev`

---

## Verificar publicación

Una vez publicado:

```
Frontend: https://smartlife.vercel.app
Backend:  https://smartlife-backend.onrender.com
Health:   https://smartlife-backend.onrender.com/api/v1/health
```

### Usuarios de prueba
| Email | Contraseña | Rol |
|-------|-----------|-----|
| `demo@example.com` | `123456` | USER |
| `admin@example.com` | `admin123` | ADMIN |
