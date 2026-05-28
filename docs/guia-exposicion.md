# Guía para la Exposición en Vivo

---

## 1. Estructura de la presentación (10-15 min)

| Tiempo | Tema | Puntos clave |
|--------|------|-------------|
| 2 min | Problema y solución | Qué resuelve Smart Life Organizer |
| 2 min | Tecnologías | React + Express + Prisma + SQLite |
| 2 min | Framework backend (3.1) | Rutas, controladores, servicios, middleware |
| 2 min | Servicios web (3.2) | API REST, endpoints, JSON, API externa |
| 2 min | AJAX (3.3) | Axios, búsqueda dinámica, login sin recargar |
| 2 min | Seguridad (3.4) | JWT, bcrypt, Zod, roles, rate limiting |
| 2 min | Publicación (3.5) | Cómo se despliega, URL funcional |
| 1 min | Recorrido rápido por la app | Dashboard → Actividades → Calendario → Admin |

---

## 2. Guión sugerido por requisito

### Problema que resuelve
> _"Smart Life Organizer ayuda a estudiantes y profesionales a gestionar su tiempo: organiza actividades, horarios fijos, hábitos y transporte. Todo en un solo lugar con sugerencias inteligentes."_

Demostrar: Crear una actividad rápidamente y ver cómo aparece en el dashboard.

### Tecnologías utilizadas
| Capa | Tecnología | Para qué |
|------|-----------|----------|
| Frontend | React + Vite + Tailwind | UI dinámica y responsiva |
| Backend | Express + TypeScript | API REST estructurada |
| Base de datos | SQLite + Prisma ORM | BD relacional con consultas seguras |
| Autenticación | JWT + bcrypt | Sesiones seguras |
| Peticiones | Axios | Comunicación asíncrona |

### Framework backend (3.1)
Mostrar en el código la estructura de carpetas:

```
backend/src/
├── controllers/   → Lógica de endpoints
├── services/      → Lógica de negocio
├── routes/        → Definición de rutas
├── middleware/    → auth, admin
└── utils/         → Validadores (Zod), Prisma client
```

Demostrar: Abrir `routes/activityRoutes.ts` y señalar cómo una petición `GET /activities` pasa por `middleware` → `controller` → `service` → Prisma.

### Servicios web (3.2)
Mostrar:
- **API REST**: Abrir Postman o el navegador y hacer `GET /api/v1/activities` — mostrar que responde JSON
- **API externa**: Abrir el dashboard, mostrar el widget de clima (wttr.in)
- **CRUD**: Crear, editar y eliminar una actividad desde la interfaz

Mencionar: _> "Todos los endpoints devuelven JSON, los probamos con 28 tests unitarios."_

### AJAX (3.3)
Demostrar en vivo:
1. Iniciar sesión — la página **no se recarga**, solo cambia al dashboard
2. Buscar actividades — escribir en el buscador, los resultados se filtran solos (debounce)
3. Crear actividad — se abre un modal, se guarda y la tabla se actualiza sin recargar
4. Abrir la consola del navegador (F12 → Red) y mostrar que son peticiones `fetch`/`axios`

Mencionar: _> "Todas las interacciones son asíncronas. El interceptor de Axios renueva automáticamente el JWT cuando expira."_

### Seguridad (3.4)
Demostrar cada punto:

| Medida | Demostración |
|--------|-------------|
| **Validación** | Crear actividad sin título → muestra error del Zod schema |
| **SQL Injection** | _"Prisma genera consultas parametrizadas, es imposible inyectar SQL"_ |
| **Sesiones JWT** | Abrir DevTools → Aplicación → localStorage, mostrar el token |
| **Contraseñas cifradas** | _"bcrypt con 12 rondas de sal, ni el admin puede ver contraseñas"_ |
| **Roles** | Mostrar que un usuario normal NO ve el panel Admin. Loguearse como admin y mostrarlo |
| **Rate limiting** | _"10 intentos por minuto en registro, 60 en general"_ |

### Publicación (3.5)
Mostrar:
- La app corriendo local (`localhost:3001` + `localhost:5178`)
- O si está en línea, mostrar la URL
- Enseñar `docs/publicacion.md` y decir: _"El proyecto está listo para Railway, Render o Vercel"_

---

## 3. Recorrido rápido por la app (1 min)

1. **Login** → `demo@example.com` / `123456`
2. **Dashboard** — señalar: tiempo libre (con transporte descontado), clima por hora, sugerencias
3. **Actividades** — crear una rápida, mostrar filtros y paginación
4. **Transporte** — mostrar selector de día
5. **Calendario** — cambiar a vista semana
6. **Admin** (logearse como admin) — usuarios, detalle de usuario, logs

---

## 4. Defensa técnica — preguntas frecuentes

| Pregunta | Respuesta |
|----------|-----------|
| ¿Por qué SQLite y no MySQL? | _"Porque Railway y Render lo soportan sin configuración extra. Con Prisma migrar a PostgreSQL es cambiar una línea."_ |
| ¿Cómo evitas que los admins se eliminen entre sí? | _"En el frontend el botón de eliminar se oculta si el usuario tiene rol ADMIN. En backend hay una validación extra antes de borrar."_ |
| ¿Cómo funciona el motor de scheduling? | _"Toma los horarios fijos del usuario, calcula espacios libres, descuenta el transporte del día y sugiere dónde colocar actividades según prioridad y plazo."_ |
| ¿Por qué usas Zustand y no Context? | _"Zustand es más liviano, no causa re-renders innecesarios y tiene middleware para persistencia."_ |
| ¿Cómo se renovó el JWT? | _"El interceptor de Axios detecta un 401, llama a `/auth/refresh` con el refresh token, obtiene uno nuevo y reintenta la petición original."_ |
| ¿Qué pasa si la API de clima falla? | _"El widget muestra 'No disponible' y el resto del dashboard sigue funcionando normalmente."_ |

---

## 5. Modificaciones en vivo — prepárate para esto

El profesor puede pedirte que **cambies algo en vivo**. Ten preparado:

### Cambio fácil: Agregar un campo

```typescript
// En el schema de Prisma (backend/prisma/schema.prisma)
model Activity {
  // ... campos existentes
  location String?  // ← nuevo campo
}
```

### Cambio medio: Agregar un endpoint

```typescript
// En backend/src/routes/activityRoutes.ts
router.get('/stats', authMiddleware, activityController.getStats)
```

Luego crear el método en el controlador y el servicio.

### Cambio difícil: Nueva funcionalidad pequeña

Por ejemplo, un botón "Duplicar actividad":
1. Agregar el botón en el frontend
2. Llamar a `POST /activities` con los mismos datos
3. Mostrar toast de éxito

### Tips para modificaciones en vivo

- Ten el proyecto abierto en VS Code con los archivos clave visibles
- Usa `npx tsc --noEmit` rápido para verificar que no hay errores
- Si algo sale mal, di: _"Déjame reiniciar el servidor rápido"_ y haz `Ctrl+C` + `npm run dev`
- No entres en pánico — los errores son normales, lo importante es mostrar que sabes depurar

---

## 6. Checklist pre-exposición

- [ ] Servidores corriendo (backend :3001, frontend :5178)
- [ ] DevTools abiertos en pestaña Red para mostrar AJAX
- [ ] Navegador con pestañas: app, Postman (opcional), código
- [ ] Usuario demo creado (demo@example.com / 123456)
- [ ] Admin creado (admin@example.com / admin123)
- [ ] Al menos 1 transporte creado con día asignado
- [ ] Al menos 1 actividad pendiente con deadline
- [ ] Código compilado sin errores (`npx tsc --noEmit`)
- [ ] Pruebas pasando (`npm test`)
- [ ] `database/smartlife-schema.sql` actualizado
- [ ] `docs/` listos para mostrar si preguntan

---

## 7. Cierre

> _"Smart Life Organizer demuestra cómo construir una aplicación web moderna integrando un framework backend, API REST, comunicación asíncrona, seguridad en múltiples capas y despliegue en la nube. Todo el código está documentado y probado. Gracias."_

Mantén la calma, muestra confianza, y si no sabes algo, di la verdad: _"No lo tengo presente ahorita, pero sé dónde buscarlo en el código."_
