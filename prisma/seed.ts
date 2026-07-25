import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.leftover.deleteMany();
  await prisma.move.deleteMany();
  await prisma.opsLogEntry.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.weeklyGoalProgress.deleteMany();
  await prisma.nextWeekBattle.deleteMany();
  await prisma.weeklySummary.deleteMany();
  await prisma.sixWeekSummary.deleteMany();
  await prisma.weeklyPlanRow.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.northStar.deleteMany();
  await prisma.sprint.deleteMany();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time
  const startDate = subDays(today, 9); // Day 1 was 9 days ago, making today Day 10.
  const endDate = addDays(startDate, 83);

  // 1. Sprint
  const sprint = await prisma.sprint.create({
    data: {
      startDate,
      endDate,
      status: "active",
    },
  });

  // 2. NorthStar
  await prisma.northStar.create({
    data: {
      sprintId: sprint.id,
      statement: "Build the foundation of an unstoppable execution engine and honor the Codex.",
      version: 1,
      isActive: true,
    },
  });

  // 3. Goals
  const goal1 = await prisma.goal.create({
    data: {
      sprintId: sprint.id,
      orderIndex: 1,
      goalText: "Ship v1 of Sprint OS",
      successLooksLike: "App is fully usable locally, tracking days, weeks, and blocks without bugs.",
      deadline: endDate,
      whyImportant: "It replaces my fragile paper notebook system.",
      isLearningGoal: false,
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      sprintId: sprint.id,
      orderIndex: 2,
      goalText: "Learn advanced Next.js patterns",
      successLooksLike: "Comfortable with Server Actions, App Router caching, and advanced layouts.",
      deadline: endDate,
      whyImportant: "Crucial for my career growth as an engineer.",
      isLearningGoal: true,
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      sprintId: sprint.id,
      orderIndex: 3,
      goalText: "Maintain 80%+ Deep Work consistency",
      successLooksLike: "Average 4h deep work per day over the 12 weeks.",
      deadline: endDate,
      whyImportant: "Deep work is the lead measure for all high-impact output.",
      isLearningGoal: false,
    },
  });

  // 4. WeeklyPlanRows
  const planRows = [];
  for (let i = 1; i <= 12; i++) {
    planRows.push({
      sprintId: sprint.id,
      weekNumber: i,
      focusArea: i === 12 ? "Buffer" : `Focus for Week ${i}`,
      delivery: i === 12 ? "Tidy up" : `Deliverable ${i}`,
      difficulty: i === 1 ? 3 : i === 6 ? 8 : 5,
    });
  }
  await prisma.weeklyPlanRow.createMany({ data: planRows });

  // 5. DailyLogs (1 to 10)
  for (let i = 1; i <= 10; i++) {
    const isLaw2Violated = i === 4 || i === 7;
    const logDate = addDays(startDate, i - 1);
    
    const dailyLog = await prisma.dailyLog.create({
      data: {
        sprintId: sprint.id,
        dayNumber: i,
        date: logDate,
        weekNumber: Math.min(Math.ceil(i / 7), 12),
        locked: i < 10,
        northStarReaffirmed: true,
        criticalTarget: "4",
        criticalReality: i % 2 === 0 ? "4" : "3",
        energyLevel: i === 5 ? "Low" : i > 7 ? "High" : "Medium",
        codexLawViolated: isLaw2Violated ? "Law2" : "None",
        whyViolated: isLaw2Violated ? "Got distracted by social media." : undefined,
      },
    });

    // 6. OpsLogEntries
    await prisma.opsLogEntry.create({
      data: {
        dailyLogId: dailyLog.id,
        startTime: "09:00",
        endTime: "11:00",
        activity: "Deep Work Session 1",
        activityType: "deep_work",
      },
    });

    await prisma.opsLogEntry.create({
      data: {
        dailyLogId: dailyLog.id,
        startTime: "13:00",
        endTime: "15:00",
        activity: "Deep Work Session 2",
        activityType: "deep_work",
      },
    });
    
    await prisma.opsLogEntry.create({
      data: {
        dailyLogId: dailyLog.id,
        startTime: "15:30",
        endTime: "16:30",
        activity: "Emails and Slack",
        activityType: "work",
      },
    });

    // 7. Moves
    await prisma.move.createMany({
      data: [
        { dailyLogId: dailyLog.id, orderIndex: 1, taskText: "Implement feature A", done: true },
        { dailyLogId: dailyLog.id, orderIndex: 2, taskText: "Review PRs", done: true },
        { dailyLogId: dailyLog.id, orderIndex: 3, taskText: "Write documentation", done: false },
      ],
    });
  }

  // Generate leftovers (manually mimicking task 14)
  for (let i = 2; i <= 10; i++) {
    const prevLog = await prisma.dailyLog.findUnique({
      where: { sprintId_dayNumber: { sprintId: sprint.id, dayNumber: i - 1 } },
      include: { moves: { where: { done: false } } }
    });
    const currentLog = await prisma.dailyLog.findUnique({
      where: { sprintId_dayNumber: { sprintId: sprint.id, dayNumber: i } }
    });

    if (prevLog && prevLog.moves.length > 0 && currentLog) {
      await prisma.leftover.createMany({
        data: prevLog.moves.map(m => ({
          dailyLogId: currentLog.id,
          sourceMoveId: m.id,
          description: m.taskText
        }))
      });
    }
  }

  // 8. WeeklySummary for Week 1
  const week1Summary = await prisma.weeklySummary.create({
    data: {
      sprintId: sprint.id,
      weekNumber: 1,
      locked: true,
      totalDeepWorkHours: 28,
      totalWorkHours: 35,
      codexViolationCountJson: JSON.stringify({ Law1: 0, Law2: 1, Law3: 0, None: 6 }),
      energyLevel: "Medium",
      motivation: 8,
      trustInGoal: 90,
      manifestSentence: "A solid start, need to protect deep work time better.",
    },
  });

  await prisma.weeklyGoalProgress.createMany({
    data: [
      { weeklySummaryId: week1Summary.id, goalId: goal1.id, progressPercent: 10, expectedText: "Basic setup", evidenceText: "Repo created" },
      { weeklySummaryId: week1Summary.id, goalId: goal2.id, progressPercent: 5, expectedText: "Read docs", evidenceText: "Finished chapter 1" },
      { weeklySummaryId: week1Summary.id, goalId: goal3.id, progressPercent: 20, expectedText: "Track time", evidenceText: "Time tracked all week" },
    ],
  });

  await prisma.nextWeekBattle.createMany({
    data: [
      { weeklySummaryId: week1Summary.id, orderIndex: 1, battleText: "Ship Day page" },
      { weeklySummaryId: week1Summary.id, orderIndex: 2, battleText: "Avoid Law 2 violations" },
      { weeklySummaryId: week1Summary.id, orderIndex: 3, battleText: "Workout 4x" },
    ],
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
