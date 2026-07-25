import React from "react";
import { getActiveSprint } from "@/lib/sprint";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StatCards from "@/components/dashboard/StatCards";
import QuickMoves from "@/components/dashboard/QuickMoves";
import CodexHeatmap from "@/components/dashboard/CodexHeatmap";
import DeepWorkChart from "@/components/shared/DeepWorkChart";
import EnergySparkline from "@/components/dashboard/EnergySparkline";
import Link from "next/link";
import PageGrid from "@/components/shared/PageGrid";
export default async function DashboardPage() {
  const sprint = await getActiveSprint();
  if (!sprint) {
    redirect("/setup");
  }

  const sprintStartDate = new Date(sprint.startDate);
  // Reset hours to start of day for accurate day calculation
  sprintStartDate.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - sprintStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because day 1 is the start date
  const currentDayNumber = Math.min(Math.max(diffDays, 1), 84);
  const currentWeekNumber = Math.ceil(currentDayNumber / 7);

  const todayLog = await prisma.dailyLog.findUnique({
    where: {
      sprintId_dayNumber: { sprintId: sprint.id, dayNumber: currentDayNumber }
    },
    include: {
      moves: true,
      leftovers: true
    }
  });

  const currentSummary = await prisma.weeklySummary.findUnique({
    where: {
      sprintId_weekNumber: { sprintId: sprint.id, weekNumber: currentWeekNumber }
    }
  });

  const allLogs = await prisma.dailyLog.findMany({
    where: { sprintId: sprint.id },
    select: { 
      dayNumber: true, 
      codexLawViolated: true, 
      energyLevel: true,
      opsLogEntries: {
        select: {
          activityType: true,
          startTime: true,
          endTime: true
        }
      }
    }
  });

  // Calculate Deep Work Chart data for the current week
  const weekStartDay = (currentWeekNumber - 1) * 7 + 1;
  const currentWeekLogs = allLogs.filter(l => l.dayNumber >= weekStartDay && l.dayNumber < weekStartDay + 7);
  const deepWorkData = Array.from({ length: 7 }, (_, i) => {
    const dayLog = currentWeekLogs.find(l => l.dayNumber === weekStartDay + i);
    let deepWorkHours = 0;
    if (dayLog && dayLog.opsLogEntries) {
      deepWorkHours = dayLog.opsLogEntries
        .filter(entry => entry.activityType === "deep_work")
        .reduce((acc, entry) => {
          try {
            const start = new Date(`1970-01-01T${entry.startTime}:00`);
            const end = new Date(`1970-01-01T${entry.endTime}:00`);
            let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (hours < 0) hours += 24; // Handle over midnight
            return acc + (hours > 0 ? hours : 0);
          } catch (e) {
            return acc;
          }
        }, 0);
    }
    return deepWorkHours;
  });
  // Example daily target: 20h/week = ~2.8h/day
  const deepWorkTarget = Array.from({ length: 7 }, () => 2.8);
  const deepWorkCategories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="max-w-5xl mx-auto py-8 pb-24 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Sprint: {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/day/${currentDayNumber}`}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition"
          >
            Today&apos;s Log
          </Link>
          <Link
            href={`/week/${currentWeekNumber}/summary`}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
          >
            Weekly Summary
          </Link>
        </div>
      </div>

      <StatCards sprint={sprint} todayLog={todayLog} currentSummary={currentSummary} />

      <PageGrid
        sidebar={
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[300px]">
              <QuickMoves 
                moves={todayLog?.moves || []} 
                leftovers={todayLog?.leftovers || []} 
                locked={todayLog?.locked || false} 
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <EnergySparkline logs={allLogs as any} currentDayNumber={currentDayNumber} />
            </div>
          </>
        }
        main={
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <CodexHeatmap logs={allLogs as any} />
          </div>
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
    </div>
  );
}
