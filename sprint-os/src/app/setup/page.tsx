import { getActiveSprint } from "@/lib/sprint";
import { prisma } from "@/lib/prisma";
import NorthStarCard from "@/components/setup/NorthStarCard";
import GoalCard from "@/components/setup/GoalCard";
import { redirect } from "next/navigation";
import SetupPageClient from "./SetupPageClient";

export default async function SetupPage() {
  const sprint = await getActiveSprint();

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Active Sprint</h1>
        <p className="text-gray-500 mb-8 max-w-md">You don&apos;t have an active sprint right now. Ready to start your next 12-week execution cycle?</p>
        <a href="/sprint/new" className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition shadow-sm">
          Plan New Sprint
        </a>
      </div>
    );
  }

  // Fetch NorthStar
  let northStar = await prisma.northStar.findFirst({
    where: { sprintId: sprint.id, isActive: true }
  });

  // Fetch Goals
  const goals = await prisma.goal.findMany({
    where: { sprintId: sprint.id },
    orderBy: { orderIndex: 'asc' }
  });

  // Check if at least one DailyLog exists
  const dailyLogCount = await prisma.dailyLog.count({
    where: { sprintId: sprint.id }
  });

  const isLocked = sprint.status === "active" && dailyLogCount > 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sprint Setup</h1>
        <p className="text-gray-500 mt-2">Define your North Star and key goals for this 12-week sprint.</p>
        {isLocked && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
            <strong>Sprint is in progress.</strong> Goals are locked to prevent mid-sprint scope creep.
          </div>
        )}
      </div>

      <SetupPageClient 
        initialNorthStar={northStar!} 
        initialGoals={goals} 
        sprint={sprint} 
        initiallyLocked={isLocked}
      />
    </div>
  );
}
