import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { id: "Estudio", name: "Estudio", icon: "📚", color: "#6C63FF" },
  { id: "Trabajo", name: "Trabajo", icon: "💼", color: "#9F7AEA" },
  { id: "Obligaciones", name: "Obligaciones", icon: "📋", color: "#4FD1C5" },
  { id: "Salud", name: "Salud", icon: "💪", color: "#F687B3" },
  { id: "Pasatiempos", name: "Pasatiempos", icon: "🎨", color: "#F6AD55" },
  { id: "Vida social", name: "Vida social", icon: "👥", color: "#63B3ED" },
  { id: "Vida amorosa", name: "Vida amorosa", icon: "💕", color: "#FC8181" },
  { id: "Descanso", name: "Descanso", icon: "😴", color: "#A0AEC0" },
];

async function main() {
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    await prisma.category.createMany({ data: categories });
    console.log(`Seed: ${categories.length} categorías creadas`);
  } else {
    console.log(`Seed: ${catCount} categorías ya existen`);
  }

  if (!await prisma.user.findUnique({ where: { email: "demo@example.com" } })) {
    const password = await bcrypt.hash("123456", 10);
    const user = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@example.com",
        password,
      },
    });
    console.log("Seed: Usuario demo creado (demo@example.com / 123456)");

    await prisma.fixedSchedule.createMany({
      data: [
        { userId: user.id, title: "Dormir", day: "lunes", startTime: "23:00", endTime: "07:00", type: "dormir" },
        { userId: user.id, title: "Dormir", day: "martes", startTime: "23:00", endTime: "07:00", type: "dormir" },
        { userId: user.id, title: "Dormir", day: "miércoles", startTime: "23:00", endTime: "07:00", type: "dormir" },
        { userId: user.id, title: "Dormir", day: "jueves", startTime: "23:00", endTime: "07:00", type: "dormir" },
        { userId: user.id, title: "Dormir", day: "viernes", startTime: "23:00", endTime: "07:00", type: "dormir" },
        { userId: user.id, title: "Desayuno", day: "lunes", startTime: "07:00", endTime: "07:30", type: "comida" },
        { userId: user.id, title: "Desayuno", day: "martes", startTime: "07:00", endTime: "07:30", type: "comida" },
        { userId: user.id, title: "Clase - Matemáticas", day: "lunes", startTime: "08:00", endTime: "10:00", type: "clase" },
        { userId: user.id, title: "Clase - Matemáticas", day: "miércoles", startTime: "08:00", endTime: "10:00", type: "clase" },
        { userId: user.id, title: "Clase - Programación", day: "martes", startTime: "10:00", endTime: "12:00", type: "clase" },
        { userId: user.id, title: "Clase - Programación", day: "jueves", startTime: "10:00", endTime: "12:00", type: "clase" },
        { userId: user.id, title: "Comida", day: "lunes", startTime: "14:00", endTime: "15:00", type: "comida" },
        { userId: user.id, title: "Comida", day: "martes", startTime: "14:00", endTime: "15:00", type: "comida" },
        { userId: user.id, title: "Comida", day: "miércoles", startTime: "14:00", endTime: "15:00", type: "comida" },
        { userId: user.id, title: "Trabajo - Proyecto X", day: "lunes", startTime: "16:00", endTime: "19:00", type: "trabajo" },
        { userId: user.id, title: "Trabajo - Proyecto X", day: "miércoles", startTime: "16:00", endTime: "19:00", type: "trabajo" },
        { userId: user.id, title: "Trabajo - Proyecto X", day: "viernes", startTime: "16:00", endTime: "19:00", type: "trabajo" },
      ],
    });
    console.log("Seed: Horarios fijos demo creados");

    await prisma.activity.createMany({
      data: [
        { userId: user.id, categoryId: "Estudio", title: "Estudiar cálculo diferencial", description: "Repasar derivadas e integrales", duration: 120, priority: "alta", deadline: new Date("2026-06-01"), startTime: "10:00", splittable: true, status: "pendiente" },
        { userId: user.id, categoryId: "Trabajo", title: "Preparar presentación semanal", description: "Slides para reunión del viernes", duration: 90, priority: "alta", deadline: new Date("2026-05-25"), startTime: "16:00", splittable: false, status: "pendiente" },
        { userId: user.id, categoryId: "Salud", title: "Rutina de ejercicio", description: "30 min de cardio + estiramientos", duration: 45, priority: "media", deadline: new Date("2026-05-22"), startTime: "07:30", splittable: false, status: "pendiente" },
        { userId: user.id, categoryId: "Obligaciones", title: "Pagar servicios", description: "Luz, agua, internet", duration: 30, priority: "media", deadline: new Date("2026-05-30"), startTime: "12:00", splittable: false, status: "pendiente" },
        { userId: user.id, categoryId: "Pasatiempos", title: "Leer libro", description: "Terminar capítulos 5-8", duration: 60, priority: "baja", deadline: new Date("2026-06-15"), startTime: "20:00", splittable: true, status: "pendiente" },
        { userId: user.id, categoryId: "Vida social", title: "Cena con amigos", duration: 150, priority: "baja", deadline: new Date("2026-05-24"), startTime: "20:00", splittable: false, status: "pendiente" },
        { userId: user.id, categoryId: "Estudio", title: "Hacer ejercicios de programación", description: "LeetCode medium problems", duration: 90, priority: "alta", deadline: new Date("2026-05-28"), startTime: "09:00", splittable: true, status: "completada" },
      ],
    });
    console.log("Seed: Actividades demo creadas");

    await prisma.habit.createMany({
      data: [
        { userId: user.id, title: "Leer 20 minutos", target: 1, streak: 5, completed: 1, lastCompletedAt: new Date() },
        { userId: user.id, title: "Meditar", target: 1, streak: 3, completed: 1, lastCompletedAt: new Date() },
        { userId: user.id, title: "Beber 8 vasos de agua", target: 8, streak: 12, completed: 4, lastCompletedAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
        { userId: user.id, title: "Escribir diario", target: 1, streak: 0, completed: 0, lastCompletedAt: null },
      ],
    });
    console.log("Seed: Hábitos demo creados");

    await prisma.transport.createMany({
      data: [
        { userId: user.id, origin: "Casa", destination: "Universidad", duration: 30 },
        { userId: user.id, origin: "Universidad", destination: "Casa", duration: 30 },
        { userId: user.id, origin: "Casa", destination: "Trabajo", duration: 45 },
      ],
    });
    console.log("Seed: Transportes demo creados");
  }

  // Siempre asegura que el admin existe (útil si fue eliminado)
  if (!await prisma.user.findUnique({ where: { email: "admin@example.com" } })) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("Seed: Usuario admin recreado (admin@example.com / admin123)");
  } else {
    console.log(`Seed: Admin ya existe, se omite`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
