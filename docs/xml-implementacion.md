# XML — Implementación (Unidad 2)

## Resumen

Se agregó exportación e importación de datos en formato XML usando la librería `fast-xml-parser` v5.8.0.

---

## Stack técnico

| Capa | Librería | Propósito |
|------|----------|-----------|
| Backend | `fast-xml-parser` | Generar XML desde objetos JS (`XMLBuilder`) y parsear XML a objetos JS (`XMLParser`) |
| Backend | Express `express.text()` | Middleware para aceptar `text/xml` y `application/xml` en requests |
| Frontend | Axios + `Blob` | Descargar archivo XML |
| Frontend | `document.createElement('a')` | Disparar descarga desde el navegador |

---

## Endpoints

### `GET /api/v1/xml/export`

Exporta todos los datos del usuario autenticado en formato XML.

**Response** (`Content-Type: application/xml`, `Content-Disposition: attachment`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<export>
  <exportedAt>2026-05-27T12:00:00.000Z</exportedAt>
  <activities>
    <activity>
      <id>abc123</id>
      <title>Estudiar matemáticas</title>
      <duration>120</duration>
      <priority>alta</priority>
      <deadline>2026-06-01T23:59:00.000Z</deadline>
      <status>pendiente</status>
      <splittable>false</splittable>
      <category id="cat1">
        <name>Estudio</name>
        <icon>📚</icon>
        <color>#6C63FF</color>
      </category>
    </activity>
  </activities>
  <schedules>
    <schedule>
      <title>Clase de inglés</title>
      <day>Lunes</day>
      <startTime>09:00</startTime>
      <endTime>10:30</endTime>
      <type>clase</type>
    </schedule>
  </schedules>
  <habits>
    <habit>
      <title>Leer 30 min</title>
      <streak>5</streak>
      <target>1</target>
      <completed>1</completed>
    </habit>
  </habits>
  <transports>
    <transport>
      <origin>Casa</origin>
      <destination>Oficina</destination>
      <duration>45</duration>
    </transport>
  </transports>
</export>
```

### `POST /api/v1/xml/import`

Acepta un XML con la misma estructura y crea registros en la base de datos.

**Request** (`Content-Type: application/xml`):
Mismo formato que el export.

**Response**:
```json
{
  "message": "Importación completada",
  "imported": {
    "activities": 3,
    "schedules": 2,
    "habits": 1,
    "transports": 0
  }
}
```

---

## Archivos creados

### `backend/src/services/xmlService.ts`

Servicio principal con dos métodos:
- `exportData(userId)` — consulta actividades, horarios, hábitos y transportes del usuario, los formatea y genera XML con `XMLBuilder`
- `importData(userId, xml)` — parsea el XML con `XMLParser` y crea los registros en BD

Usa `fast-xml-parser` con las siguientes opciones:
- `format: true` — salida indentada
- `ignoreAttributes: false` — preserva atributos (ej: `category id="cat1"`)
- `suppressEmptyNode: true` — omite nodos vacíos
- `isArray` — fuerza arrays para nodos aunque tengan 1 elemento

### `backend/src/routes/xmlRoutes.ts`

Dos rutas protegidas con `authMiddleware`:
- `GET /export` → `xmlService.exportData()`
- `POST /import` → `xmlService.importData()`

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/routes/index.ts` | Se agregó `import xmlRoutes` y `router.use("/xml", xmlRoutes)` |
| `backend/src/server.ts` | Se agregó `express.text({ type: ["text/xml", "application/xml"] })` para parsear bodies XML |
| `backend/package.json` | Se agregó dependencia `fast-xml-parser` |
| `frontend/src/pages/Dashboard/DashboardPage.tsx` | Se agregaron botones "Exportar XML" e "Importar XML" |

---

## Frontend — Dashboard

En `DashboardPage.tsx` se agregaron:

**Exportar XML** — llama a `GET /api/v1/xml/export`, crea un `Blob` con `Content-Type: application/xml` y dispara la descarga como archivo `.xml`.

**Importar XML** — abre un `input[type=file]`, lee el archivo seleccionado como texto, lo envía a `POST /api/v1/xml/import` con `Content-Type: application/xml`, muestra resumen de registros importados vía toast y recarga el dashboard.

---

## Pruebas

### Backend — `backend/tests/xmlService.test.ts`

5 tests que verifican:

| Test | Descripción |
|------|-------------|
| XML válido | Genera XML con declaración, `<export>`, `<title>`, `<duration>` |
| Múltiples actividades | Genera XML con 2 actividades correctamente |
| Categoría como atributo | Genera `<category id="cat1">` con hijos |
| Parseo de exportación | Parsea XML y obtiene valores correctos |
| Parseo con horarios | Parsea XML con schedule y verifica campos |

### Frontend — `frontend/tests/xmlService.test.ts`

3 tests que verifican creación de Blob XML, generación de URL de descarga y lectura como texto.

---

## Criterios de evaluación cubiertos

- [x] Generación de documentos XML desde datos de la aplicación
- [x] Parseo de XML a objetos del dominio
- [x] Endpoint REST que devuelve XML (`Content-Type: application/xml`)
- [x] Endpoint REST que acepta XML (`Content-Type: text/xml`, `application/xml`)
- [x] Interfaz de usuario para exportar XML (botón + descarga)
- [x] Interfaz de usuario para importar XML (selector de archivo + carga)
- [x] Pruebas unitarias para generación y parseo (8 tests total)
