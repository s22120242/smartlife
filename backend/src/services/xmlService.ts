import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { prisma } from '../utils/prisma'

// Unidad 2 — XML: implementación de exportación e importación de datos en formato XML

const XML_DECL = '<?xml version="1.0" encoding="UTF-8"?>\n'

// Builder genera XML con formato legible desde objetos JS
const builder = new (XMLBuilder as any)({
  format: true,
  indentBy: '  ',
  ignoreAttributes: false,
  suppressEmptyNode: true,
  isArray: (name: string) =>
    ['activities', 'schedules', 'habits', 'transports', 'activity', 'schedule', 'habit', 'transport'].includes(name),
})

// Parser convierte XML a objetos JS para su procesamiento
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

export const xmlService = {
  // Exporta datos del usuario a XML (servicio web síncrono)
  async exportData(userId: string): Promise<string> {
    const [activities, schedules, habits, transports] = await Promise.all([
      prisma.activity.findMany({ where: { userId }, include: { category: true } }),
      prisma.fixedSchedule.findMany({ where: { userId } }),
      prisma.habit.findMany({ where: { userId } }),
      prisma.transport.findMany({ where: { userId } }),
    ])

    const data = {
      export: {
        exportedAt: new Date().toISOString(),
        activities: { activity: activities.map(formatActivity) },
        schedules: { schedule: schedules.map(formatSchedule) },
        habits: { habit: habits.map(formatHabit) },
        transports: { transport: transports.map(formatTransport) },
      },
    }

    return XML_DECL + builder.build(data)
  },

  // Importa datos desde XML y los guarda en la BD (servicio web asíncrono)
  async importData(userId: string, xml: string) {
    const parsed = parser.parse(xml)
    const data = parsed.export
    if (!data) throw new Error('Formato XML inválido: falta raíz <export>')

    let activitiesCount = 0
    let schedulesCount = 0
    let habitsCount = 0
    let transportsCount = 0

    if (data.activities?.activity) {
      const items = Array.isArray(data.activities.activity) ? data.activities.activity : [data.activities.activity]
      for (const item of items) {
        const category = await prisma.category.findFirst({ where: { name: item.category?.name || '' } })
        await prisma.activity.create({
          data: {
            userId,
            title: item.title,
            description: item.description || null,
            duration: Number(item.duration),
            priority: item.priority || 'media',
            deadline: item.deadline ? new Date(item.deadline) : null,
            startTime: item.startTime || null,
            splittable: item.splittable === 'true',
            status: item.status || 'pendiente',
            categoryId: category?.id || (await getDefaultCategory()),
          },
        })
        activitiesCount++
      }
    }

    if (data.schedules?.schedule) {
      const items = Array.isArray(data.schedules.schedule) ? data.schedules.schedule : [data.schedules.schedule]
      for (const item of items) {
        await prisma.fixedSchedule.create({
          data: {
            userId,
            title: item.title,
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            type: item.type || 'general',
          },
        })
        schedulesCount++
      }
    }

    if (data.habits?.habit) {
      const items = Array.isArray(data.habits.habit) ? data.habits.habit : [data.habits.habit]
      for (const item of items) {
        await prisma.habit.create({
          data: {
            userId,
            title: item.title,
            streak: Number(item.streak || 0),
            target: Number(item.target || 1),
            completed: Number(item.completed || 0),
            lastCompletedAt: item.lastCompletedAt ? new Date(item.lastCompletedAt) : null,
          },
        })
        habitsCount++
      }
    }

    if (data.transports?.transport) {
      const items = Array.isArray(data.transports.transport) ? data.transports.transport : [data.transports.transport]
      for (const item of items) {
        await prisma.transport.create({
          data: {
            userId,
            origin: item.origin,
            destination: item.destination,
            duration: Number(item.duration),
            day: item.day || null,
          },
        })
        transportsCount++
      }
    }

    return { activities: activitiesCount, schedules: schedulesCount, habits: habitsCount, transports: transportsCount }
  },
}

function formatActivity(a: any) {
  return {
    id: a.id,
    title: a.title,
    description: a.description || undefined,
    duration: a.duration,
    priority: a.priority,
    deadline: a.deadline?.toISOString() || undefined,
    startTime: a.startTime || undefined,
    splittable: a.splittable,
    status: a.status,
    category: {
      '@_id': a.category?.id,
      name: a.category?.name,
      icon: a.category?.icon || undefined,
      color: a.category?.color || undefined,
    },
  }
}

function formatSchedule(s: any) {
  return {
    id: s.id,
    title: s.title,
    day: s.day,
    startTime: s.startTime,
    endTime: s.endTime,
    type: s.type,
  }
}

function formatHabit(h: any) {
  return {
    id: h.id,
    title: h.title,
    streak: h.streak,
    target: h.target,
    completed: h.completed,
    lastCompletedAt: h.lastCompletedAt?.toISOString() || undefined,
  }
}

function formatTransport(t: any) {
  return {
    id: t.id,
    origin: t.origin,
    destination: t.destination,
    duration: t.duration,
    day: t.day || undefined,
  }
}

async function getDefaultCategory() {
  const cat = await prisma.category.findFirst()
  if (!cat) throw new Error('No hay categorías disponibles. Ejecuta el seed primero.')
  return cat.id
}
