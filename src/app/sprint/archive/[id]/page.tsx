import React from "react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArchiveModeProvider } from "@/contexts/ArchiveModeContext";
import StatCards from "@/components/dashboard/StatCards";
import CodexHeatmap from "@/components/dashboard/CodexHeatmap";
import EnergySparkline from "@/components/dashboard/EnergySparkline";
import DeepWorkChart from "@/components/shared/DeepWorkChart";
import QuickMoves from "@/components/dashboard/QuickMoves";
import Link from "next/link";

export default async function SprintArchivePage({ params }: { params: { id: string } }) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: params.id }
  });

  if (!sprint || sprint.status !== "completed") {
    redirect("/");
  }

  // Fetch data to reuse dashboard layout
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

  // Since sprint is completed, show the final day's numbers (Day 84)
  const currentDayNumber = 84;
  const currentWeekNumber = 12;

  const lastLog = await prisma.dailyLog.findUnique({
    where: {
      sprintId_dayNumber: { sprintId: sprint.id, dayNumber: currentDayNumber }
    },
    include: { moves: true, leftovers: true }
  });

  const lastSummary = await prisma.weeklySummary.findUnique({
    where: {
      sprintId_weekNumber: { sprintId: sprint.id, weekNumber: currentWeekNumber }
    }
  });

  // Calculate Deep Work Chart data for the last week (Week 12)
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
            if (hours < 0) hours += 24;
            return acc + (hours > 0 ? hours : 0);
          } catch (e) {
            return acc;
          }
        }, 0);
    }
    return deepWorkHours;
  });

  const workData = Array.from({ length: 7 }, (_, i) => {
    const dayLog = currentWeekLogs.find(l => l.dayNumber === weekStartDay + i);
    let workHours = 0;
    if (dayLog && dayLog.opsLogEntries) {
      workHours = dayLog.opsLogEntries
        .filter(entry => entry.activityType === "deep_work" || entry.activityType === "work")
        .reduce((acc, entry) => {
          try {
            const start = new Date(`1970-01-01T${entry.startTime}:00`);
            const end = new Date(`1970-01-01T${entry.endTime}:00`);
            let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (hours < 0) hours += 24;
            return acc + (hours > 0 ? hours : 0);
          } catch (e) {
            return acc;
          }
        }, 0);
    }
    return workHours;
  });
  
  const deepWorkTarget = Array.from({ length: 7 }, () => 2.8);
  const deepWorkCategories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <ArchiveModeProvider value={true}>
      <div className="max-w-5xl mx-auto py-8 pb-24 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-amber-500">Archive:</span> Sprint ({new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()})
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Completed Sprint Overview</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <StatCards sprint={sprint} todayLog={lastLog} currentSummary={lastSummary} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[300px]">
              <QuickMoves 
                moves={lastLog?.moves || []} 
                leftovers={lastLog?.leftovers || []} 
                locked={true} 
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <CodexHeatmap logs={allLogs as any} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <EnergySparkline logs={allLogs as any} currentDayNumber={currentDayNumber} />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <DeepWorkChart 
            categories={deepWorkCategories} 
            deepWorkData={deepWorkData} 
            workData={workData}
            target={deepWorkTarget} 
          />
        </div>
      </div>
    </ArchiveModeProvider>
  );
}
