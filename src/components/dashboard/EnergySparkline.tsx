"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DailyLog } from "@prisma/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function EnergySparkline({
  logs,
  currentDayNumber
}: {
  logs: DailyLog[];
  currentDayNumber: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // Show the 7 days of the current week to keep chart data consistent
  const weekStartDay = Math.floor((currentDayNumber - 1) / 7) * 7 + 1;
  const days = Array.from({ length: 7 }, (_, i) => weekStartDay + i);

  const data = days.map(dayNum => {
    const log = logs.find(l => l.dayNumber === dayNum);
    if (!log || !log.energyLevel) return 0; // default to 0 to prevent nulls in series
    if (log.energyLevel === "High") return 3;
    if (log.energyLevel === "Medium") return 2;
    if (log.energyLevel === "Low") return 1;
    return 0;
  });

  const series = [{
    name: "Energy",
    data
  }];

  const options: any = {
    chart: {
      type: "area",
      sparkline: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#10b981"], // Emerald green
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: { enabled: false },
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: {
        title: { formatter: () => "Energy:" },
        formatter: (val: number) => {
          if (val === 3) return "High";
          if (val === 2) return "Medium";
          if (val === 1) return "Low";
          return "None";
        }
      },
      marker: { show: false }
    },
    yaxis: {
      min: 0,
      max: 3,
    },
  };

  if (!mounted) {
    return (
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">7-Day Energy Trend</h2>
        <div className="h-[100px] flex items-center justify-center text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">7-Day Energy Trend</h2>
      {days.length > 0 ? (
        <div className="h-[100px] mt-2">
          <ReactApexChart options={options} series={series} type="area" width="100%" height={100} />
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Not enough data.</p>
      )}
    </div>
  );
}

