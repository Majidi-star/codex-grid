import { getActiveSprint } from "@/lib/sprint";
import { prisma } from "@/lib/prisma";
import { getDayNumber, getWeekNumber, getDateForDayNumber } from "@/lib/date";
import { redirect } from "next/navigation";
import DayHeader from "@/components/day/DayHeader";
import NorthStarStrip from "@/components/day/NorthStarStrip";
import CreateLogButton from "@/components/day/CreateLogButton";
import MovesList from "@/components/day/MovesList";
import LeftoversList from "@/components/day/LeftoversList";
import OpsLog from "@/components/day/OpsLog";
import DayStartReview from "@/components/day/DayStartReview";
import DayEndReview from "@/components/day/DayEndReview";
import LockButton from "@/components/shared/LockButton";
import { format } from "date-fns";
import { updateDailyLog } from "@/lib/actions/dailyLog";

export default async function DayPage({ params }: { params: { dayNumber: string } }) {
  const sprint = await getActiveSprint();

  if (!sprint) {
    redirect("/setup");
  }

  const requestedDayNumber = parseInt(params.dayNumber, 10);
  if (isNaN(requestedDayNumber) || requestedDayNumber < 1 || requestedDayNumber > 84) {
    return <div>Invalid day number</div>;
  }

  const targetDate = getDateForDayNumber(sprint.startDate, requestedDayNumber);
  const currentDayNumber = getDayNumber(sprint.startDate);
  const weekNumber = getWeekNumber(requestedDayNumber);

  // Fetch DailyLog
  const dailyLog = await prisma.dailyLog.findFirst({
    where: { sprintId: sprint.id, dayNumber: requestedDayNumber },
    include: {
      moves: true,
      leftovers: true,
      opsLogEntries: true
    }
  });

  const northStar = await prisma.northStar.findFirst({
    where: { sprintId: sprint.id, isActive: true }
  });

  if (!dailyLog) {
    const isPast = requestedDayNumber < currentDayNumber;
    const isToday = requestedDayNumber === currentDayNumber;
    
    if (!isPast && !isToday) {
      return (
        <div className="max-w-5xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Day {requestedDayNumber} is in the future</h1>
          <p className="text-gray-500">You cannot create logs for future days.</p>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isPast ? `Back-filling Day ${requestedDayNumber}` : `Ready to start Day ${requestedDayNumber}?`}
          </h1>
          <p className="text-gray-500 mb-6">
            {format(targetDate, "EEEE, MMMM do, yyyy")}
          </p>
          <CreateLogButton sprintId={sprint.id} dayNumber={requestedDayNumber} date={targetDate} />
        </div>
      </div>
    );
  }

  const handleLock = async () => {
    "use server";
    await updateDailyLog(dailyLog.id, { locked: true });
  };

  const handleUnlock = async () => {
    "use server";
    await updateDailyLog(dailyLog.id, { locked: false });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 pb-24">
      <DayHeader dayNumber={requestedDayNumber} date={targetDate} weekNumber={weekNumber} />
      
      {northStar && (
        <NorthStarStrip northStar={northStar} dailyLog={dailyLog} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column (Checklists) - md:col-span-4 */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[300px]">
            <LeftoversList leftovers={dailyLog.leftovers} />
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
              <MovesList moves={dailyLog.moves} dailyLogId={dailyLog.id} />
            </div>
          </div>
        </div>

        {/* Right Column (Reviews & Ops Log) - md:col-span-8 */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <DayStartReview dailyLog={dailyLog} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[300px]">
            <OpsLog dailyLog={dailyLog} entries={dailyLog.opsLogEntries} locked={dailyLog.locked} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <DayEndReview dailyLog={dailyLog} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <LockButton locked={dailyLog.locked} onLock={handleLock} onUnlock={handleUnlock} />
      </div>
    </div>
  );
}
