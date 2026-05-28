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
