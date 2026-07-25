"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WeeklySummary, CodexLaw } from "@prisma/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Using a distinct 3-color set specifically for Codex violations to avoid confusion with goal progress colors
const CODEX_COLORS = ["#E24B4A", "#F09595", "#A32D2D"]; 

export default function CodexTrendChart({
  summaries,
  blockNumber,
  codexLaws
}: {
  summaries: WeeklySummary[];
  blockNumber: number;
  codexLaws: CodexLaw[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const weeks = blockNumber === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
  
  // Laws to track
  const activeLaws = codexLaws.map(l => l.title);

  const series = activeLaws.map((law, index) => {
    const data = weeks.map(weekNum => {
      const summary = summaries.find(s => s.weekNumber === weekNum);
      if (!summary || !summary.codexViolationCountJson) return 0;
      
      try {
        const counts = JSON.parse(summary.codexViolationCountJson);
        return counts[law] || 0;
      } catch (e) {
        return 0;
      }
    });

    return {
      name: law,
      data,
    };
  });

  const options: any = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    colors: CODEX_COLORS,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => (val != null && val > 0 ? String(val) : ""),
    },
    xaxis: {
      categories: weeks.map(w => `W${w}`),
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => (val != null ? String(Math.round(val)) : "0"),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  if (!mounted) {
    return (
      <div className="w-full mt-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Codex Violations Trend</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Codex Violations Trend</h3>
      <div className="h-[300px]">
        <ReactApexChart options={options} series={series} type="bar" width="100%" height={300} />
      </div>
    </div>
  );
}

