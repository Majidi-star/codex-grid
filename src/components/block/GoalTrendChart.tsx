"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Goal, WeeklyGoalProgress, WeeklySummary } from "@prisma/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FIXED_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#9b51e0", "#f2c94c"];

import { useTheme } from "@/components/tailadmin/context/ThemeContext";

export default function GoalTrendChart({
  goals,
  summaries,
}: {
  goals: Goal[];
  summaries: (WeeklySummary & { goalProgress: WeeklyGoalProgress[] })[];
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const sortedGoals = [...goals].sort((a, b) => a.orderIndex - b.orderIndex);

  const series = sortedGoals.map((goal, index) => {
    const data = Array.from({ length: 12 }, (_, i) => {
      const weekNum = i + 1;
      const summary = summaries.find((s) => s.weekNumber === weekNum);
      if (!summary) return null;
      const progress = summary.goalProgress.find((p) => p.goalId === goal.id);
      return progress ? progress.progressPercent : null;
    });

    return {
      name: goal.goalText,
      data,
      color: FIXED_COLORS[index % FIXED_COLORS.length],
    };
  });

  const options: any = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    colors: sortedGoals.map((_, i) => FIXED_COLORS[i % FIXED_COLORS.length]),
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: Array.from({ length: 12 }, (_, i) => `W${i + 1}`),
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => (val != null ? `${String(Math.round(val))}%` : ""),
      },
    },
    legend: { show: false },
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#f1f5f9",
      strokeDashArray: 4,
    },
    theme: {
      mode: theme,
    },
  };

  if (!mounted) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Goal Progress Trend</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Goal Progress Trend</h3>
      
      {/* Custom Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {sortedGoals.map((goal, index) => (
          <div key={goal.id} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: FIXED_COLORS[index % FIXED_COLORS.length] }} 
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs" title={goal.goalText}>
              {goal.goalText}
            </span>
          </div>
        ))}
      </div>

      <div className="h-[300px]">
        <ReactApexChart options={options} series={series} type="line" width="100%" height={300} />
      </div>
    </div>
  );
}

