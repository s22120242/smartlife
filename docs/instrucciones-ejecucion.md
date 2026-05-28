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
| 5 | Hosting en servidor externo | ✅ Preparado para Render |

## 9. Publicar en Render (gratis, sin tarjeta)

### Requisitos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Render](https://render.com) (usando "Sign up with GitHub")

### Pasos

**1. Subir el proyecto a GitHub**

```bash
# Crea un repositorio en GitHub (vacío, sin README ni .gitignore)
# Luego ejecuta:
git remote add origin https://github.com/TU_USUARIO/smart-life-organizer.git
git branch -M main
git push -u origin main
```

**2. Crear Web Service en Render**
1. En Render, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name:** `smart-life-organizer`
   - **Root Directory:** *(déjalo vacío — el build script está en la raíz)*
   - **Runtime:** `Node`
   - **Build Command:** `chmod +x render-build.sh && ./render-build.sh`
   - **Start Command:** `cd backend && bash start.sh`
   - **Plan:** **Free**

4. Agrega variables de entorno en Render:
   ```
   JWT_SECRET=1f08f8b50a09b7a01d6ce697c3201d5f
   JWT_EXPIRES_IN=7d
   PORT=10000
   CORS_ORIGIN=*
   NODE_ENV=production
   ```

5. Haz clic en **"Deploy Web Service"**

**3. Esperar el deploy**

Render tarda ~3-5 min en construir y desplegar. Al terminar asigna una URL como:
```
https://smart-life-organizer.onrender.com
```

**4. Usuarios de prueba**
| Email | Contraseña | Rol |
|-------|-----------|------|
| `demo@example.com` | `123456` | USER |
| `admin@example.com` | `admin123` | ADMIN |

**Nota:** En el plan Free de Render, el servicio se duerme tras 15 min de inactividad. Al recibir una petición tarda ~30s en reactivarse. Los datos de SQLite se pierden al reiniciar. Para persistencia real, migrar a PostgreSQL (ver `docs/publicacion.md`).
