"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DeepWorkChart({
  categories,
  deepWorkData,
  workData,
  target,
}: {
  categories: string[];
  deepWorkData: number[];
  workData: number[];
  target: number[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const series = [
    {
      name: "Total Work",
      type: "area",
      data: workData,
    },
    {
      name: "Deep Work",
      type: "column",
      data: deepWorkData,
    },
    {
      name: "Target (Deep Work)",
      type: "line",
      data: target,
    },
  ];

  const options: any = {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ["#93c5fd", "#2563eb", "#6b7280"], // Light blue for work, brand blue for deep work, gray for target
    stroke: {
      width: [2, 0, 2],
      curve: "smooth",
      dashArray: [0, 0, 4] // Dashed line for target
    },
    fill: {
      type: ['gradient', 'solid', 'solid'],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1], // Only show labels on deep work bars
      formatter: (val: number) => (val != null && val > 0 ? String(Math.round(val * 10) / 10) : ""),
      style: {
        fontSize: '10px',
        colors: ["#fff"]
      }
    },
    xaxis: {
      categories,
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
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
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 2,
      }
    }
  };

  if (!mounted) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Deep Work vs Target</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Deep Work vs Target</h3>
      <div className="h-[300px]">
        <ReactApexChart options={options} series={series} type="line" width="100%" height={300} />
      </div>
    </div>
  );
}

