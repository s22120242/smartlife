-- =============================================
-- Smart Life Organizer - Esquema Completo BD
-- Generado desde Prisma Migrations
-- =============================================


-- Migration: 20260528055017_add_refresh_token

-- AlterTable
ALTER TABLE "User" ADD COLUMN "refreshToken" TEXT;

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_userId_status_idx" ON "Activity"("userId", "status");

-- CreateIndex
CREATE INDEX "Activity_userId_priority_deadline_idx" ON "Activity"("userId", "priority", "deadline");

-- CreateIndex
CREATE INDEX "FixedSchedule_userId_idx" ON "FixedSchedule"("userId");

-- CreateIndex
CREATE INDEX "FixedSchedule_userId_day_idx" ON "FixedSchedule"("userId", "day");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");

-- CreateIndex
CREATE INDEX "Suggestion_userId_idx" ON "Suggestion"("userId");

-- CreateIndex
CREATE INDEX "Transport_userId_idx" ON "Transport"("userId");


-- Migration: 20260528061617_add_role_field

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "profileImage" TEXT,
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "profileImage", "refreshToken", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "profileImage", "refreshToken", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;


-- Migration: 20260528071601_add_admin_logs

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "targetId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Migration: 20260520075150_init

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT
);

-- CreateTable
CREATE TABLE "FixedSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "FixedSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'media',
    "deadline" DATETIME,
    "splittable" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "day" TEXT,
    CONSTRAINT "Transport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


-- Migration: 20260520083111_add_last_completed_at

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN "lastCompletedAt" DATETIME;


-- Migration: 20260522052428_add_start_time

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "startTime" TEXT;


-- =============================================
-- Datos de semilla (Seed)
-- Categor�as por defecto
-- =============================================

INSERT OR IGNORE INTO Category (id, name, icon, color) VALUES
('Estudio', 'Estudio', '??', '#6C63FF'),
('Trabajo', 'Trabajo', '??', '#9F7AEA'),
('Obligaciones', 'Obligaciones', '??', '#4FD1C5'),
('Salud', 'Salud', '??', '#F687B3'),
('Pasatiempos', 'Pasatiempos', '??', '#F6AD55'),
('Vida social', 'Vida social', '??', '#63B3ED'),
('Vida amorosa', 'Vida amorosa', '??', '#FC8181'),
('Descanso', 'Descanso', '??', '#A0AEC0');
