-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NorthStar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NorthStar_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "goalText" TEXT NOT NULL,
    "successLooksLike" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "whyImportant" TEXT NOT NULL,
    "isLearningGoal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Goal_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyPlanRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "focusArea" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    CONSTRAINT "WeeklyPlanRow_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "northStarReaffirmed" BOOLEAN NOT NULL DEFAULT false,
    "criticalTarget" TEXT,
    "criticalReality" TEXT,
    "energyLevel" TEXT,
    "energyWhy" TEXT,
    "focusKiller" TEXT,
    "solutionForTomorrow" TEXT,
    "sleepTime" TEXT,
    "codexLawAtRisk" TEXT NOT NULL DEFAULT 'None',
    "preventionMethod" TEXT,
    "codexLawViolated" TEXT NOT NULL DEFAULT 'None',
    "whyViolated" TEXT,
    "correctionForTomorrow" TEXT,
    "useFreeformOpsLog" BOOLEAN NOT NULL DEFAULT false,
    "freeformOpsLog" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyLog_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLogId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "taskText" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Move_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Leftover" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLogId" TEXT NOT NULL,
    "sourceMoveId" TEXT,
    "description" TEXT NOT NULL,
    CONSTRAINT "Leftover_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Leftover_sourceMoveId_fkey" FOREIGN KEY ("sourceMoveId") REFERENCES "Move" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpsLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLogId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "activityType" TEXT,
    CONSTRAINT "OpsLogEntry_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklySummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "totalDeepWorkHours" REAL,
    "totalWorkHours" REAL,
    "whatWorked" TEXT,
    "whatFailed" TEXT,
    "mostRepetitiveIssue" TEXT,
    "redFlags" TEXT,
    "victoryMoment" TEXT,
    "correctionNextWeek" TEXT,
    "codexViolationCountJson" TEXT,
    "energyLevel" TEXT,
    "motivation" INTEGER,
    "trustInGoal" INTEGER,
    "manifestSentence" TEXT,
    "reviewedCodexBook" BOOLEAN NOT NULL DEFAULT false,
    "skillStage" TEXT,
    "vsGreatsComparison" TEXT,
    "needMoreChallenge" BOOLEAN NOT NULL DEFAULT false,
    "needScheduleUpdate" BOOLEAN NOT NULL DEFAULT false,
    "analyzedMistakeLedger" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "WeeklySummary_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyGoalProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklySummaryId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "progressPercent" INTEGER NOT NULL,
    "expectedText" TEXT,
    "evidenceText" TEXT,
    CONSTRAINT "WeeklyGoalProgress_weeklySummaryId_fkey" FOREIGN KEY ("weeklySummaryId") REFERENCES "WeeklySummary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeeklyGoalProgress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NextWeekBattle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklySummaryId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "battleText" TEXT NOT NULL,
    CONSTRAINT "NextWeekBattle_weeklySummaryId_fkey" FOREIGN KEY ("weeklySummaryId") REFERENCES "WeeklySummary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SixWeekSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sprintId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "aggregateDeepWorkHours" REAL,
    "aggregateWorkHours" REAL,
    "overallGoalTrendJson" TEXT,
    "biggestWin" TEXT,
    "biggestFailure" TEXT,
    "codexViolationTrendJson" TEXT,
    "adjustmentsForNextBlock" TEXT,
    "northStarStillAccurate" BOOLEAN,
    "updatedNorthStarText" TEXT,
    CONSTRAINT "SixWeekSummary_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlanRow_sprintId_weekNumber_key" ON "WeeklyPlanRow"("sprintId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_sprintId_dayNumber_key" ON "DailyLog"("sprintId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySummary_sprintId_weekNumber_key" ON "WeeklySummary"("sprintId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyGoalProgress_weeklySummaryId_goalId_key" ON "WeeklyGoalProgress"("weeklySummaryId", "goalId");

-- CreateIndex
CREATE UNIQUE INDEX "SixWeekSummary_sprintId_blockNumber_key" ON "SixWeekSummary"("sprintId", "blockNumber");
