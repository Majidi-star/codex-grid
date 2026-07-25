import { getActiveSprint } from "@/lib/sprint";
import { prisma } from "@/lib/prisma";
import RoadmapTable from "@/components/roadmap/RoadmapTable";
import { getDayNumber, getWeekNumber } from "@/lib/date";
import { redirect } from "next/navigation";

export default async function RoadmapPage() {
  const sprint = await getActiveSprint();

  if (!sprint) {
    redirect("/setup");
  }

  const rows = await prisma.weeklyPlanRow.findMany({
    where: { sprintId: sprint.id },
    orderBy: { weekNumber: 'asc' }
  });

  const dayNumber = getDayNumber(sprint.startDate);
  const weekNumber = getWeekNumber(dayNumber);
  const progressPercent = Math.min((dayNumber / 84) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sprint Roadmap</h1>
          <p className="text-gray-500 mt-2">12-week execution plan.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-1">
            Day {dayNumber} / 84
          </div>
          <div className="text-xs text-gray-400">
            Week {weekNumber}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <RoadmapTable rows={rows} currentWeekNumber={weekNumber} />
    </div>
  );
}
