import { getActiveSprint } from "@/lib/sprint";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WeeklyMetrics from "@/components/week/WeeklyMetrics";
import GoalProgressTable from "@/components/week/GoalProgressTable";
import NextWeekBattles from "@/components/week/NextWeekBattles";
import WeeklyReflections from "@/components/week/WeeklyReflections";
import WeeklyStateStrip from "@/components/week/WeeklyStateStrip";
import LearningSection from "@/components/week/LearningSection";
import LockButton from "@/components/shared/LockButton";
import DeepWorkChart from "@/components/shared/DeepWorkChart";
import { updateWeeklySummary } from "@/lib/actions/weeklySummary";
import PageGrid from "@/components/shared/PageGrid";

export default async function WeeklySummaryPage({ params }: { params: { weekNumber: string } }) {
  const sprint = await getActiveSprint();
  if (!sprint) {
    redirect("/setup");
  }

  const weekNumber = parseInt(params.weekNumber, 10);
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 12) {
    redirect("/");
  }

  // Check if Day 7 of this week exists
  const day7Number = weekNumber * 7;
  const day7Log = await prisma.dailyLog.findUnique({
    where: {
      sprintId_dayNumber: { sprintId: sprint.id, dayNumber: day7Number }
    }
  });

  let weeklySummary = await prisma.weeklySummary.findUnique({
    where: {
      sprintId_weekNumber: { sprintId: sprint.id, weekNumber }
    },
    include: { goalProgress: true, battles: true }
  });

  if (!weeklySummary) {
    weeklySummary = await prisma.weeklySummary.create({
      data: { sprintId: sprint.id, weekNumber },
      include: { goalProgress: true, battles: true }
    });
  }

  const goals = await prisma.goal.findMany({
    where: { sprintId: sprint.id }
  });


  // Calculate Deep Work Chart data for the block
  const blockNumber = weekNumber <= 6 ? 1 : 2;
  const blockWeeks = blockNumber === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
  
  const blockSummaries = await prisma.weeklySummary.findMany({
    where: { sprintId: sprint.id, weekNumber: { in: blockWeeks } },
    select: { weekNumber: true, totalDeepWorkHours: true }
  });

  const deepWorkData = blockWeeks.map(wNum => {
    const sum = blockSummaries.find(s => s.weekNumber === wNum);
    return sum?.totalDeepWorkHours || 0;
  });
  const deepWorkTarget = Array.from({ length: 6 }, () => 20); // 20h/week
  const deepWorkCategories = blockWeeks.map(w => `W${w}`);

  const hasLearningGoal = goals.some(g => g.isLearningGoal);

  const handleLock = async () => {
    "use server";
    await updateWeeklySummary(weeklySummary.id, { locked: true });
  };

  const handleUnlock = async () => {
    "use server";
    await updateWeeklySummary(weeklySummary.id, { locked: false });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Week {weekNumber} Summary
      </h1>

      {!day7Log && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200">
          <p className="font-medium">
            Day 7 of this week hasn&apos;t been logged yet — numbers below may be incomplete.
          </p>
        </div>
      )}

      <PageGrid
        sidebar={
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <WeeklyMetrics summary={weeklySummary} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <WeeklyStateStrip summary={weeklySummary} />
            </div>
            {hasLearningGoal && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <LearningSection summary={weeklySummary} />
              </div>
            )}
          </>
        }
        main={
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <GoalProgressTable 
                weeklySummaryId={weeklySummary.id} 
                goals={goals} 
                progressList={weeklySummary.goalProgress} 
                locked={weeklySummary.locked} 
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <WeeklyReflections summary={weeklySummary} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <NextWeekBattles 
                weeklySummaryId={weeklySummary.id} 
                battles={weeklySummary.battles} 
                locked={weeklySummary.locked} 
              />
            </div>
          </>
        }
        bottom={
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <DeepWorkChart 
              categories={deepWorkCategories} 
              data={deepWorkData} 
              target={deepWorkTarget} 
            />
          </div>
        }
      />

      <div className="mt-8 flex justify-end">
        <LockButton locked={weeklySummary.locked} onLock={handleLock} onUnlock={handleUnlock} />
      </div>
    </div>
  );
}
