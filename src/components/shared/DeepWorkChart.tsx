"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DeepWorkChart({
  categories,
  data,
  target,
}: {
  categories: string[];
  data: number[];
  target: number[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const series = [
    {
      name: "Actual Hours",
      type: "column",
      data,
    },
    {
      name: "Target Hours",
      type: "line",
      data: target,
    },
  ];

  const options: any = {
    chart: {
      type: "line",
      toolbar: { show: false },
    },
    colors: ["#2a78d6", "#9ca3af"], // Brand blue for actual, gray for target
    stroke: {
      width: [0, 2],
      curve: "smooth",
      dashArray: [0, 4] // Dashed line for target
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0], // Only show labels on bars
      formatter: (val: number) => (val != null && val > 0 ? String(val) : ""),
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

