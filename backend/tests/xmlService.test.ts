import { describe, it, expect } from 'vitest'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'

const XML_DECL = '<?xml version="1.0" encoding="UTF-8"?>\n'

const builder = new XMLBuilder({
  format: true,
  indentBy: '  ',
  ignoreAttributes: false,
  suppressEmptyNode: true,
  isArray: (name) =>
    ['activities', 'schedules', 'habits', 'transports', 'activity', 'schedule', 'habit', 'transport'].includes(name),
})

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

describe('XML Generation', () => {
  it('debe generar XML con estructura válida', () => {
    const xml = XML_DECL + builder.build({
      export: {
        exportedAt: '2026-05-27T12:00:00.000Z',
        activities: {
          activity: [
            { id: '1', title: 'Test Activity', duration: 60, priority: 'alta', status: 'pendiente', splittable: false },
          ],
        },
        schedules: { schedule: [] },
        habits: { habit: [] },
        transports: { transport: [] },
      },
    })

    expect(xml).toContain('<?xml')
    expect(xml).toContain('<export>')
    expect(xml).toContain('<title>Test Activity</title>')
    expect(xml).toContain('<duration>60</duration>')
  })

  it('debe generar XML con múltiples actividades', () => {
    const xml = XML_DECL + builder.build({
      export: {
        exportedAt: new Date().toISOString(),
        activities: {
          activity: [
            { id: '1', title: 'Tarea 1', duration: 30, priority: 'alta', status: 'pendiente', splittable: false },
            { id: '2', title: 'Tarea 2', duration: 60, priority: 'media', status: 'completada', splittable: true },
          ],
        },
        schedules: { schedule: [] },
        habits: { habit: [] },
        transports: { transport: [] },
      },
    })

    expect(xml).toContain('<title>Tarea 1</title>')
    expect(xml).toContain('<title>Tarea 2</title>')
  })

  it('debe incluir categoría como atributo', () => {
    const xml = XML_DECL + builder.build({
      export: {
        exportedAt: new Date().toISOString(),
        activities: {
          activity: [
            {
              id: '1',
              title: 'Estudiar',
              duration: 120,
              priority: 'alta',
              status: 'pendiente',
              splittable: false,
              category: { '@_id': 'cat1', name: 'Estudio', icon: '📚', color: '#6C63FF' },
            },
          ],
        },
        schedules: { schedule: [] },
        habits: { habit: [] },
        transports: { transport: [] },
      },
    })

    expect(xml).toContain('<category id="cat1">')
    expect(xml).toContain('<name>Estudio</name>')
  })
})

describe('XML Parsing', () => {
  it('debe parsear un XML de exportación', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <export exportedAt="2026-05-27T12:00:00.000Z">
        <activities>
          <activity>
            <title>Tarea 1</title>
            <duration>60</duration>
            <priority>media</priority>
            <status>pendiente</status>
            <splittable>false</splittable>
          </activity>
        </activities>
        <schedules></schedules>
        <habits></habits>
        <transports></transports>
      </export>`

    const result = parser.parse(xml)
    expect(result.export).toBeDefined()
    expect(result.export.activities.activity.title).toBe('Tarea 1')
    expect(result.export.activities.activity.duration).toBe(60)
  })

  it('debe parsear XML con horarios', () => {
    const xml = `<?xml version="1.0"?>
      <export>
        <activities></activities>
        <schedules>
          <schedule>
            <title>Clase de inglés</title>
            <day>Lunes</day>
            <startTime>09:00</startTime>
            <endTime>10:30</endTime>
            <type>clase</type>
          </schedule>
        </schedules>
        <habits></habits>
        <transports></transports>
      </export>`

    const result = parser.parse(xml)
    expect(result.export.schedules.schedule.title).toBe('Clase de inglés')
    expect(result.export.schedules.schedule.day).toBe('Lunes')
    expect(result.export.schedules.schedule.startTime).toBe('09:00')
    expect(result.export.schedules.schedule.endTime).toBe('10:30')
  })
})
