"use client";
import React from "react";
import { DailyLog } from "@prisma/client";
import { CODEX_LAW } from "@/lib/enums";

export default function CodexHeatmap({
  logs
}: {
  logs: DailyLog[];
}) {
  // Generate 84 cells (Day 1 to 84)
  const cells = Array.from({ length: 84 }, (_, i) => {
    const dayNumber = i + 1;
    const log = logs.find(l => l.dayNumber === dayNumber);
    let violationsCount = 0;

    if (log && (log as any).codexLawViolated && (log as any).codexLawViolated !== "None") {
      violationsCount = 1;
    }

    return { dayNumber, violationsCount };
  });

  const getCellColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count === 1) return "bg-red-200 dark:bg-red-900/40";
    if (count === 2) return "bg-red-400 dark:bg-red-700/70";
    return "bg-red-600 dark:bg-red-500";
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Codex Violations Heatmap</h2>
      <div className="flex gap-4">
        {/* Y-axis labels (Weeks) */}
        <div className="flex flex-col justify-between py-1 text-xs text-gray-400">
          <span>W1</span>
          <span>W4</span>
          <span>W8</span>
          <span>W12</span>
        </div>
        
        {/* Heatmap Grid (7 columns = 7 days of week, 12 rows = 12 weeks) */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 max-w-sm">
          {cells.map((cell) => (
            <div
              key={cell.dayNumber}
              className={`w-full aspect-square rounded-sm ${getCellColor(cell.violationsCount)} transition-colors duration-200 hover:ring-2 hover:ring-brand-500`}
              title={`Day ${cell.dayNumber}: ${cell.violationsCount} violation${cell.violationsCount === 1 ? '' : 's'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-900/40" />
          <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-700/70" />
          <div className="w-3 h-3 rounded-sm bg-red-600 dark:bg-red-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
