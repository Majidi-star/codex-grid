"use client";
import React from "react";
import { Sprint, DailyLog, WeeklySummary } from "@prisma/client";

export default function StatCards({
  sprint,
  todayLog,
  currentSummary
}: {
  sprint: Sprint;
  todayLog: DailyLog | null;
  currentSummary: WeeklySummary | null;
}) {
  const sprintStartDate = new Date(sprint.startDate);
  const now = new Date();
  
  // Calculate day counter (1-84)
  const diffTime = Math.abs(now.getTime() - sprintStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.max(diffDays, 1), 84);
  const progressPercent = (currentDay / 84) * 100;

  // Deep work stats
  const weeklyDeepWorkTarget = 20; // Hardcoded default, could be dynamic later
  const currentDeepWork = currentSummary?.totalDeepWorkHours || 0;
  const deepWorkPercent = Math.min((currentDeepWork / weeklyDeepWorkTarget) * 100, 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Day Counter Ring */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sprint Day</span>
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{ 
            background: `conic-gradient(#2a78d6 ${progressPercent}%, transparent ${progressPercent}%)` 
          }}
        >
          <div className="absolute inset-[3px] bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{currentDay}</span>
          </div>
        </div>
        <span className="text-xs text-gray-400 mt-2">of 84</span>
      </div>

      {/* Focus Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Focus</span>
        <div className="flex-1 flex items-center justify-center">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium text-sm">
            {todayLog?.locked ? "Locked" : "Active"}
          </span>
        </div>
      </div>

      {/* Deep Work Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col justify-center">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Weekly Deep Work</span>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500" 
            style={{ width: `${deepWorkPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-gray-900 dark:text-white">{currentDeepWork.toFixed(1)}h</span>
          <span className="text-gray-400">/ {weeklyDeepWorkTarget}h</span>
        </div>
      </div>

      {/* Energy Pill */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Energy</span>
        <div className="flex-1 flex items-center justify-center">
          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-medium text-sm ${
            todayLog?.energyLevel === "High" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
            todayLog?.energyLevel === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
            todayLog?.energyLevel === "Low" ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
            "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {todayLog?.energyLevel || "Not Set"}
          </span>
        </div>
      </div>
    </div>
  );
}
